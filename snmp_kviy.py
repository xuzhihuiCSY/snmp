from kivy.lang import Builder
from kivymd.app import MDApp
from kivymd.uix.button import MDFlatButton
from kivymd.uix.textfield import MDTextField
from kivymd.uix.list import MDList, TwoLineListItem
from kivymd.uix.label import MDLabel
from kivymd.uix.boxlayout import BoxLayout
from kivymd.uix.scrollview import ScrollView
from kivy.network.urlrequest import UrlRequest
import json

KV = '''
BoxLayout:
    orientation: 'vertical'
    padding: '10dp'
    spacing: '10dp'

    MDTextField:
        id: ip_input
        hint_text: "Enter IP address"
        pos_hint: {'center_x': 0.5}
        size_hint_x: None
        width: 300
        on_text_validate: app.search_ip()

    MDFlatButton:
        text: "Check"
        pos_hint: {'center_x': 0.5}
        on_release: app.search_ip()

    BoxLayout:
        orientation: 'vertical'
        size_hint_y: None
        height: dp(300)

        MDLabel:
            text: 'Interfaces'
            size_hint_y: None
            height: dp(30)

        ScrollView:
            MDList:
                id: interfaces_list

    BoxLayout:
        orientation: 'vertical'
        size_hint_y: None
        height: dp(300)

        MDLabel:
            text: 'Operational Processes'
            size_hint_y: None
            height: dp(30)

        ScrollView:
            MDList:
                id: processes_list
'''

class SNMPApp(MDApp):
    def build(self):
        return Builder.load_string(KV)

    def search_ip(self):
        ip_address = self.root.ids.ip_input.text
        if ip_address:
            self.fetch_data(ip_address)
            self.fetch_processes(ip_address)

    def fetch_data(self, ip):
        url = 'http://127.0.0.1:8000/api/snmp/'
        headers = {'Content-type': 'application/json'}
        params = json.dumps({"ip_address": ip})
        request = UrlRequest(url, on_success=self.update_interface_ui, req_body=params, req_headers=headers, method='POST', on_failure=self.on_error, on_error=self.on_error)

    def fetch_processes(self, ip):
        url = 'http://127.0.0.1:8000/api/processes/'
        headers = {'Content-type': 'application/json'}
        params = json.dumps({"ip_address": ip})
        request = UrlRequest(url, on_success=self.update_process_ui, req_body=params, req_headers=headers, method='POST', on_failure=self.on_error, on_error=self.on_error)

    def update_interface_ui(self, request, result):
        self.root.ids.interfaces_list.clear_widgets()
        if 'interfaces' in result:
            for interface in result['interfaces']:
                interface_name = self.extract_value(interface['interface'])
                interface_name = self.decode_interface_name(interface_name)
                status = self.extract_value(interface['status'])
                speed = self.extract_value(interface['speed']) + " bps"
                item = TwoLineListItem(text=f"Interface: {interface_name}", secondary_text=f"Status: {status}, Speed: {speed}")
                self.root.ids.interfaces_list.add_widget(item)

    def update_process_ui(self, request, result):
        self.root.ids.processes_list.clear_widgets()
        if 'processes' in result:
            for process in result['processes']:
                item = TwoLineListItem(
                    text=f"Process: {process['name']}",
                    secondary_text=f"PID: {process['pid']}, CPU: {process['cpu_usage']}, Memory: {process['memory_usage']}"
                )
                self.root.ids.processes_list.add_widget(item)

    def extract_value(self, data):
        return data.split(' = ')[1]

    def decode_interface_name(self, hex_data):
        hex_data = hex_data.strip()
        if hex_data.startswith('0x'):
            hex_data = hex_data[2:]
        hex_data = ''.join(filter(lambda c: c in '0123456789abcdefABCDEF', hex_data))
        try:
            byte_data = bytes.fromhex(hex_data)
            return byte_data.decode('utf-8')
        except ValueError as e:
            print(f"Decode Error: {e}")
            return "Invalid Encoding"

    def on_error(self, request, result):
        print("Error:", result)

if __name__ == '__main__':
    SNMPApp().run()
