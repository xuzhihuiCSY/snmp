import kivy
from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.label import Label
from kivy.uix.textinput import TextInput
from kivy.uix.button import Button
from kivy.uix.scrollview import ScrollView
from kivy.uix.gridlayout import GridLayout
from kivy.properties import StringProperty
from kivy.clock import Clock
from kivy.uix.popup import Popup
import requests

kivy.require('2.0.0')

class SNMPClient(BoxLayout):
    ip_address = StringProperty("")
    device_info = StringProperty("")
    interfaces = StringProperty("")
    uptime = StringProperty("")
    processes = []  # List to store all fetched processes
    displayed_processes = []  # List to store displayed processes

    def __init__(self, **kwargs):
        super(SNMPClient, self).__init__(**kwargs)
        self.orientation = 'vertical'
        self.padding = [20, 20, 20, 20]
        self.spacing = 20
        
        # IP Address input
        self.ip_input = TextInput(hint_text='Enter IP Address', multiline=False, size_hint_y=None, height=40)
        self.add_widget(self.ip_input)
        
        # Submit Button
        self.submit_btn = Button(text='Check', on_press=self.on_submit, size_hint_y=None, height=40)
        self.add_widget(self.submit_btn)
        
        # Device Info Section
        self.device_info_label = Label(text='Device Information', font_size='20sp', size_hint_y=None, height=30, bold=True, color=[0.1, 0.5, 0.8, 1])
        self.add_widget(self.device_info_label)
        
        self.device_info_box = BoxLayout(orientation='vertical', padding=[10, 10, 10, 10], spacing=10, size_hint_y=None)
        self.device_info_text = Label(text=self.device_info, font_size='16sp', size_hint_y=None)
        self.device_info_text.bind(texture_size=self.device_info_text.setter('size'))
        self.device_info_box.add_widget(self.device_info_text)
        self.device_info_box.bind(minimum_height=self.device_info_box.setter('height'))
        self.add_widget(self.device_info_box)
        
        # Interfaces Section
        self.interfaces_label = Label(text='Interfaces', font_size='20sp', size_hint_y=None, height=30, bold=True, color=[0.1, 0.5, 0.8, 1])
        self.add_widget(self.interfaces_label)
        
        self.interfaces_scroll = ScrollView(size_hint=(1, None), size=(self.width, 200), do_scroll_x=False)
        self.interfaces_grid = GridLayout(cols=1, size_hint_y=None, padding=10, spacing=10)
        self.interfaces_grid.bind(minimum_height=self.interfaces_grid.setter('height'))
        self.interfaces_scroll.add_widget(self.interfaces_grid)
        self.add_widget(self.interfaces_scroll)
        
        # Processes Section (New Section)
        self.processes_label = Label(text='Operational Processes', font_size='20sp', size_hint_y=None, height=30, bold=True, color=[0.1, 0.5, 0.8, 1])
        self.add_widget(self.processes_label)
        
        self.processes_scroll = ScrollView(size_hint=(1, None), size=(self.width, 200), do_scroll_x=False)
        self.processes_grid = GridLayout(cols=1, size_hint_y=None, padding=10, spacing=10)
        self.processes_grid.bind(minimum_height=self.processes_grid.setter('height'))
        self.processes_scroll.add_widget(self.processes_grid)
        self.add_widget(self.processes_scroll)

    def on_submit(self, instance):
        self.ip_address = self.ip_input.text
        Clock.schedule_once(self.fetch_snmp_data, 0)
    
    def fetch_snmp_data(self, dt):
        ip = self.ip_address
        try:
            response = requests.post('http://127.0.0.1:8000/api/snmp/', json={'ip_address': ip})
            response.raise_for_status()
            data = response.json()
            self.update_device_info(data)
            self.update_interfaces(data['interfaces'])
            self.processes = data['processes']  # Assuming processes are part of the response
            self.displayed_processes = []  # Reset displayed processes
            Clock.schedule_interval(self.update_displayed_processes, 5)  # Update processes display every 5 seconds
        except requests.RequestException as e:
            self.show_error_popup(f"Error: {e}")

    def update_displayed_processes(self, dt):
        if len(self.displayed_processes) < len(self.processes):
            self.displayed_processes.append(self.processes[len(self.displayed_processes)])
            self.processes_grid.add_widget(Label(text=self.displayed_processes[-1], size_hint_y=None, height=30))
        else:
            return False  # Stop scheduling when all processes are displayed

    def update_device_info(self, data):
        description = self.get_value_after_equals(data.get('description', 'Not Public Feature'))
        hardware, software = self.split_description(description)
        device_info = {
            'System Name': self.get_value_after_equals(data.get('name', 'Not Public Feature')),
            'Hardware': hardware,
            'Software': software,
            'Uptime': self.get_value_after_equals(data.get('uptime', 'Not Public Feature')),
            'Location': self.get_value_after_equals(data.get('location', 'Not Public Feature')),
            'Contact': self.get_value_after_equals(data.get('contact', 'Not Public Feature'))
        }
        self.device_info = '\n'.join([f'{key}: {value}' for key, value in device_info.items()])
        self.device_info_text.text = self.device_info
        self.uptime = self.get_value_after_equals(data.get('uptime', 'Not Public Feature'))

    def split_description(self, description):
        hardware = software = "Not Public Feature"
        if " - Software: " in description:
            hardware, software = description.split(" - Software: ")
            software = "Software: " + software
        return hardware, software

    def update_interfaces(self, interfaces):
        self.interfaces_grid.clear_widgets()
        for iface in interfaces:
            iface_name = self.truncate_string(self.decode_hex_string(self.get_value_after_equals(iface['interface'])), 20)
            status = self.get_value_after_equals(iface['status'])
            speed = self.get_value_after_equals(iface['speed'])
            inbound_traffic = self.get_value_after_equals(iface['inbound_traffic'])
            outbound_traffic = self.get_value_after_equals(iface['outbound_traffic'])
            
            self.interfaces_grid.add_widget(Label(text=f"Interface: {iface_name}", size_hint_y=None, height=30))
            self.interfaces_grid.add_widget(Label(text=f"Status: {status}", size_hint_y=None, height=30))
            self.interfaces_grid.add_widget(Label(text=f"Speed: {speed} bps", size_hint_y=None, height=30))
            self.interfaces_grid.add_widget(Label(text=f"Inbound Traffic: {inbound_traffic} octets", size_hint_y=None, height=30))
            self.interfaces_grid.add_widget(Label(text=f"Outbound Traffic: {outbound_traffic} octets", size_hint_y=None, height=30))

    def get_value_after_equals(self, value):
        return value.split('=')[1].strip() if '=' in value else value

    def decode_hex_string(self, hex_string):
        if hex_string.startswith('0x'):
            hex = hex_string[2:]
            str = ''.join([chr(int(hex[i:i+2], 16)) for i in range(0, len(hex), 2)])
            return str
        return hex_string

    def truncate_string(self, str, num):
        return str[:num] + '...' if len(str) > num else str

    def show_error_popup(self, message):
        popup = Popup(title='Error',
                      content=Label(text=message),
                      size_hint=(0.8, 0.4))
        popup.open()

class SNMPApp(App):
    def build(self):
        return SNMPClient()

if __name__ == '__main__':
    SNMPApp().run()
