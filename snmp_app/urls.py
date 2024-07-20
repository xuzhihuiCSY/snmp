from django.urls import path
from .views import SNMPAPIView, UptimeAPIView, InterfaceInfoAPIView, ProcessInfoAPIView

urlpatterns = [
    path('api/snmp/', SNMPAPIView.as_view(), name='snmp'),
    path('api/uptime/', UptimeAPIView.as_view(), name='uptime'),
    path('api/interfaces/', InterfaceInfoAPIView.as_view(), name='interfaces'),
    path('api/processes/', ProcessInfoAPIView.as_view(), name='processes'), 
]
