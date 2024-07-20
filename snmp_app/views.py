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
            logger.debug(f"SNMP Error: {errorIndication}")
            result.append(str(errorIndication))
            break
        elif errorStatus:
            logger.debug(f"SNMP Error: {errorStatus.prettyPrint()} at {errorIndex and varBinds[int(errorIndex) - 1][0] or '?'}")
            result.append('%s at %s' % (
                errorStatus.prettyPrint(),
                errorIndex and varBinds[int(errorIndex) - 1][0] or '?'
            ))
            break
        else:
            for varBind in varBinds:
                logger.debug(f"SNMP Response: {varBind.prettyPrint()}")
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
                'processes': snmp_walk(ip_address, '1.3.6.1.2.1.25.4.2.1.2')  # hrSWRunName
            }
            logger.debug(f"Retrieved data: {data}")
            return Response(data, status=status.HTTP_200_OK)
        logger.debug(f"Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UptimeAPIView(APIView):
    def post(self, request, format=None):
        ip_address = request.data.get('ip_address')
        if ip_address:
            uptime = snmp_get(ip_address, '1.3.6.1.2.1.1.3.0')  # sysUpTime
            return Response({'uptime': uptime}, status=status.HTTP_200_OK)
        return Response({'error': 'IP address not provided'}, status=status.HTTP_400_BAD_REQUEST)

class InterfaceInfoAPIView(APIView):
    def post(self, request, format=None):
        ip_address = request.data.get('ip_address')
        if ip_address:
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

            return Response({'interfaces': combined_interfaces}, status=status.HTTP_200_OK)
        return Response({'error': 'IP address not provided'}, status=status.HTTP_400_BAD_REQUEST)

def snmp_processes(ip):
    process_info = []
    oid = '1.3.6.1.2.1.25.4.2.1.2'
    iterator = nextCmd(
        SnmpEngine(),
        CommunityData('public'),
        UdpTransportTarget((ip, 161)),
        ContextData(),
        ObjectType(ObjectIdentity(oid)),
        lexicographicMode=False
    )

    for errorIndication, errorStatus, errorIndex, varBinds in iterator:
        if errorIndication or errorStatus:
            logger.debug(f"Error in retrieving processes: {errorIndication or errorStatus.prettyPrint()}")
            break
        process_detail = ' = '.join([x.prettyPrint() for x in varBinds])
        process_info.append(process_detail)

    return process_info

class ProcessInfoAPIView(APIView):
    def post(self, request, format=None):
        ip_address = request.data.get('ip_address')
        if ip_address:
            processes = snmp_processes(ip_address)
            return Response({'processes': processes}, status=status.HTTP_200_OK)
        return Response({'error': 'IP address not provided'}, status=status.HTTP_400_BAD_REQUEST)
