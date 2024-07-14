from django import forms

class SNMPForm(forms.Form):
    ip_address = forms.GenericIPAddressField()
