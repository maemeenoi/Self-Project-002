import SwiftUI
import CoreData

struct SettingsView: View {
    @AppStorage("defaultCurrency") private var defaultCurrency = "NZD"
    @AppStorage("notificationsEnabled") private var notificationsEnabled = true
    @AppStorage("darkModeEnabled") private var darkModeEnabled = false
    @Environment(\.managedObjectContext) private var viewContext
    @Environment(\.colorScheme) private var colorScheme
    
    let currencies = ["NZD", "USD", "EUR", "GBP", "AUD"]
    @State private var showingExportConfirmation = false
    @State private var showingBackupConfirmation = false
    @State private var showingResetConfirmation = false
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // App Preferences
                VStack(alignment: .leading, spacing: 15) {
                    HStack {
                        Text("⚙️ Preferences")
                            .font(.title2)
                            .bold()
                        Spacer()
                    }
                    
                    VStack(spacing: 15) {
                        PreferenceRow(icon: "dollarsign.circle.fill", color: .green) {
                            Picker("Currency", selection: $defaultCurrency) {
                                ForEach(currencies, id: \.self) { currency in
                                    Text(currency).tag(currency)
                                }
                            }
                            .pickerStyle(MenuPickerStyle())
                        }
                        
                        PreferenceToggle(icon: "bell.fill", color: .blue, title: "Notifications", isOn: $notificationsEnabled)
                        
                        PreferenceToggle(icon: "moon.fill", color: .purple, title: "Dark Mode", isOn: $darkModeEnabled)
                    }
                }
                .padding()
                .background(Color(UIColor.systemBackground))
                .cornerRadius(15)
                .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
                
                // Data Management
                VStack(alignment: .leading, spacing: 15) {
                    HStack {
                        Text("💾 Data Management")
                            .font(.title2)
                            .bold()
                        Spacer()
                    }
                    
                    VStack(spacing: 15) {
                        DataManagementButton(icon: "square.and.arrow.up.fill", color: .blue, title: "Export Data") {
                            showingExportConfirmation = true
                        }
                        
                        DataManagementButton(icon: "arrow.clockwise", color: .green, title: "Backup Data") {
                            showingBackupConfirmation = true
                        }
                        
                        DataManagementButton(icon: "trash.fill", color: .red, title: "Reset All Data") {
                            showingResetConfirmation = true
                        }
                    }
                }
                .padding()
                .background(Color(UIColor.systemBackground))
                .cornerRadius(15)
                .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
                
                // About
                VStack(alignment: .leading, spacing: 15) {
                    HStack {
                        Text("ℹ️ About")
                            .font(.title2)
                            .bold()
                        Spacer()
                    }
                    
                    VStack(spacing: 15) {
                        InfoRow(title: "Version", value: "1.0.0")
                        InfoRow(title: "Build", value: "2024.1")
                        
                        NavigationLink(destination: TermsView()) {
                            HStack {
                                Image(systemName: "doc.text.fill")
                                    .foregroundColor(.blue)
                                Text("Terms of Service")
                                Spacer()
                                Image(systemName: "chevron.right")
                                    .foregroundColor(.gray)
                            }
                        }
                        
                        NavigationLink(destination: PrivacyView()) {
                            HStack {
                                Image(systemName: "hand.raised.fill")
                                    .foregroundColor(.blue)
                                Text("Privacy Policy")
                                Spacer()
                                Image(systemName: "chevron.right")
                                    .foregroundColor(.gray)
                            }
                        }
                    }
                }
                .padding()
                .background(Color(UIColor.systemBackground))
                .cornerRadius(15)
                .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
            }
            .padding()
        }
        .navigationTitle("Settings")
        .preferredColorScheme(darkModeEnabled ? .dark : .light)
        .alert("Export Data", isPresented: $showingExportConfirmation) {
            Button("Export", role: .none) {
                exportData()
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("This will export your data to a CSV file.")
        }
        .alert("Backup Data", isPresented: $showingBackupConfirmation) {
            Button("Backup", role: .none) {
                backupData()
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("This will create a backup of your current data.")
        }
        .alert("Reset Data", isPresented: $showingResetConfirmation) {
            Button("Reset", role: .destructive) {
                resetData()
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("This will permanently delete all your data. This action cannot be undone.")
        }
    }
    
    private func exportData() {
        // Implement export functionality
    }
    
    private func backupData() {
        // Implement backup functionality
    }
    
    private func resetData() {
        let fetchRequest: NSFetchRequest<NSFetchRequestResult> = NSFetchRequest(entityName: "Expense")
        let deleteRequest = NSBatchDeleteRequest(fetchRequest: fetchRequest)
        
        do {
            try viewContext.execute(deleteRequest)
            try viewContext.save()
        } catch {
            print("Error resetting data: \(error)")
        }
    }
}

struct PreferenceRow<Content: View>: View {
    let icon: String
    let color: Color
    let content: () -> Content
    
    var body: some View {
        HStack {
            Image(systemName: icon)
                .foregroundColor(color)
                .font(.system(size: 20))
                .frame(width: 30)
            content()
        }
        .padding()
        .background(Color(UIColor.secondarySystemBackground))
        .cornerRadius(10)
    }
}

struct PreferenceToggle: View {
    let icon: String
    let color: Color
    let title: String
    @Binding var isOn: Bool
    
    var body: some View {
        HStack {
            Image(systemName: icon)
                .foregroundColor(color)
                .font(.system(size: 20))
                .frame(width: 30)
            Text(title)
            Spacer()
            Toggle("", isOn: $isOn)
        }
        .padding()
        .background(Color(UIColor.secondarySystemBackground))
        .cornerRadius(10)
    }
}

struct DataManagementButton: View {
    let icon: String
    let color: Color
    let title: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(color)
                    .font(.system(size: 20))
                    .frame(width: 30)
                Text(title)
                Spacer()
                Image(systemName: "chevron.right")
                    .foregroundColor(.gray)
            }
            .padding()
            .background(Color(UIColor.secondarySystemBackground))
            .cornerRadius(10)
        }
    }
}

struct InfoRow: View {
    let title: String
    let value: String
    
    var body: some View {
        HStack {
            Text(title)
            Spacer()
            Text(value)
                .foregroundColor(.gray)
        }
        .padding()
        .background(Color(UIColor.secondarySystemBackground))
        .cornerRadius(10)
    }
}

struct TermsView: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Text("Terms of Service")
                    .font(.title)
                    .bold()
                Text("Last updated: January 2024")
                    .foregroundColor(.gray)
                Text("These terms and conditions outline the rules and regulations for the use of our Budgeting App...")
                    .padding(.top)
            }
            .padding()
        }
        .navigationTitle("Terms of Service")
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct PrivacyView: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Text("Privacy Policy")
                    .font(.title)
                    .bold()
                Text("Last updated: January 2024")
                    .foregroundColor(.gray)
                Text("Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information...")
                    .padding(.top)
            }
            .padding()
        }
        .navigationTitle("Privacy Policy")
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    NavigationView {
        SettingsView()
            .environment(\.managedObjectContext, PersistenceController.shared.container.viewContext)
    }
} 