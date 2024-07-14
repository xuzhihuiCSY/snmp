from django.urls import path
from .views import SNMPAPIView

urlpatterns = [
    path('api/snmp/', SNMPAPIView.as_view(), name='snmp-api'),
]
