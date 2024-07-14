from rest_framework import serializers

class SNMPSerializer(serializers.Serializer):
    ip_address = serializers.IPAddressField()
    sysDescr = serializers.CharField(max_length=255, required=False)
    sysName = serializers.CharField(max_length=255, required=False)
    uptime = serializers.CharField(max_length=100, required=False)
    location = serializers.CharField(max_length=255, required=False)
    contact = serializers.CharField(max_length=255, required=False)
    cpu_load = serializers.JSONField(required=False)
    IPv4_addresses = serializers.JSONField(required=False)
    interfaces = serializers.JSONField(required=False)
    interface_status = serializers.JSONField(required=False)
    interface_speed = serializers.JSONField(required=False)
    inventory = serializers.JSONField(required=False)
