import SwiftUI

struct SettingsView: View {
    @AppStorage("defaultCurrency") private var defaultCurrency = "USD"
    @AppStorage("notificationsEnabled") private var notificationsEnabled = true
    @AppStorage("darkModeEnabled") private var darkModeEnabled = false
    
    let currencies = ["USD", "NZD", "EUR", "GBP", "AUD"]
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("General")) {
                    Picker("Default Currency", selection: $defaultCurrency) {
                        ForEach(currencies, id: \.self) { currency in
                            Text(currency).tag(currency)
                        }
                    }
                    
                    Toggle("Enable Notifications", isOn: $notificationsEnabled)
                    Toggle("Dark Mode", isOn: $darkModeEnabled)
                }
                
                Section(header: Text("About")) {
                    HStack {
                        Text("Version")
                        Spacer()
                        Text("1.0.0")
                            .foregroundColor(.gray)
                    }
                    
                    NavigationLink(destination: Text("Terms and conditions...")) {
                        Text("Terms of Service")
                    }
                    
                    NavigationLink(destination: Text("Privacy policy...")) {
                        Text("Privacy Policy")
                    }
                }
                
                Section(header: Text("Data Management")) {
                    Button(action: {
                        // Export data action
                    }) {
                        Text("Export Data")
                    }
                    
                    Button(action: {
                        // Backup data action
                    }) {
                        Text("Backup Data")
                    }
                }
            }
            .navigationTitle("Settings")
        }
    }
}

#Preview {
    SettingsView()
} 