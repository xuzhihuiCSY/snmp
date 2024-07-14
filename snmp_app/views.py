from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import SNMPSerializer
from pysnmp.hlapi import *
import logging

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

def snmp_get(ip, oid):
    iterator = getCmd(
        SnmpEngine(),
        CommunityData('public'),
        UdpTransportTarget((ip, 161)),
        ContextData(),
        ObjectType(ObjectIdentity(oid))
    )
    
    errorIndication, errorStatus, errorIndex, varBinds = next(iterator)
    if errorIndication:
        return str(errorIndication)
    elif errorStatus:
        return '%s at %s' % (
            errorStatus.prettyPrint(),
            errorIndex and varBinds[int(errorIndex) - 1][0] or '?'
        )
    else:
        return ' = '.join([x.prettyPrint() for x in varBinds[0]])

def snmp_walk(ip, oid):
    result = []
    iterator = nextCmd(
        SnmpEngine(),
        CommunityData('public'),
        UdpTransportTarget((ip, 161)),
        ContextData(),
        ObjectType(ObjectIdentity(oid)),
        lexicographicMode=False
    )
    
    for errorIndication, errorStatus, errorIndex, varBinds in iterator:
        if errorIndication:
            result.append(str(errorIndication))
            break
        elif errorStatus:
            result.append('%s at %s' % (
                errorStatus.prettyPrint(),
                errorIndex and varBinds[int(errorIndex) - 1][0] or '?'
            ))
            break
        else:
            for varBind in varBinds:
                result.append(' = '.join([x.prettyPrint() for x in varBind]))
    return result

class SNMPAPIView(APIView):
    def post(self, request, format=None):
        logger.debug(f"Received data: {request.data}")
        serializer = SNMPSerializer(data=request.data)
        if serializer.is_valid():
            ip_address = serializer.validated_data['ip_address']
            interfaces = snmp_walk(ip_address, '1.3.6.1.2.1.2.2.1.2')
            interface_status = snmp_walk(ip_address, '1.3.6.1.2.1.2.2.1.8')
            interface_speed = snmp_walk(ip_address, '1.3.6.1.2.1.2.2.1.5')
            inbound_traffic = snmp_walk(ip_address, '1.3.6.1.2.1.2.2.1.10')
            outbound_traffic = snmp_walk(ip_address, '1.3.6.1.2.1.2.2.1.16')

            combined_interfaces = [
                {
                    "interface": interfaces[i],
                    "status": interface_status[i],
                    "speed": interface_speed[i],
                    "inbound_traffic": inbound_traffic[i],
                    "outbound_traffic": outbound_traffic[i]
                }
                for i in range(len(interfaces))
            ]

            data = {
                'name': snmp_get(ip_address, '1.3.6.1.2.1.1.5.0'),  # sysName
                'description': snmp_get(ip_address, '1.3.6.1.2.1.1.1.0'),  # sysDescr
                'uptime': snmp_get(ip_address, '1.3.6.1.2.1.1.3.0'),  # sysUpTime
                'location': snmp_get(ip_address, '1.3.6.1.2.1.1.6.0'),  # sysLocation
                'contact': snmp_get(ip_address, '1.3.6.1.2.1.1.4.0'),  # sysContact
                'cpu_load': snmp_walk(ip_address, '1.3.6.1.2.1.25.3.3.1.2'),  # hrProcessorLoad
                'IPv4_addresses': snmp_walk(ip_address, '1.3.6.1.2.1.4.20.1'),  # ipAdEntAddr
                'interfaces': combined_interfaces,
                'inventory': snmp_walk(ip_address, '1.3.6.1.2.1.47.1.1.1.1.2'),  # entPhysicalDescr
            }
            logger.debug(f"Retrieved data: {data}")
            return Response(data, status=status.HTTP_200_OK)
        logger.debug(f"Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

