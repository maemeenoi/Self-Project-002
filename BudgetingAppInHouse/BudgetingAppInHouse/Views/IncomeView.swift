import SwiftUI
import CoreData

struct IncomeView: View {
    @Environment(\.managedObjectContext) private var viewContext
    @Environment(\.dismiss) private var dismiss
    @FetchRequest(
        sortDescriptors: [NSSortDescriptor(keyPath: \Income.date, ascending: false)],
        animation: .default)
    private var incomes: FetchedResults<Income>
    
    @State private var showingAddIncome = false
    @State private var selectedPeriod = "This Month"
    
    let periods = ["This Month", "Last Month", "Last 3 Months", "Last 6 Months", "This Year"]
    
    var filteredIncomes: [Income] {
        let calendar = Calendar.current
        let now = Date()
        let filtered: [Income]
        
        switch selectedPeriod {
        case "This Month":
            let startOfMonth = calendar.date(from: calendar.dateComponents([.year, .month], from: now))!
            filtered = incomes.filter { $0.date ?? Date() >= startOfMonth }
        case "Last Month":
            let startOfLastMonth = calendar.date(byAdding: .month, value: -1, to: calendar.date(from: calendar.dateComponents([.year, .month], from: now))!)!
            let startOfThisMonth = calendar.date(from: calendar.dateComponents([.year, .month], from: now))!
            filtered = incomes.filter { income in
                let date = income.date ?? Date()
                return date >= startOfLastMonth && date < startOfThisMonth
            }
        case "Last 3 Months":
            let startDate = calendar.date(byAdding: .month, value: -3, to: now)!
            filtered = incomes.filter { $0.date ?? Date() >= startDate }
        case "Last 6 Months":
            let startDate = calendar.date(byAdding: .month, value: -6, to: now)!
            filtered = incomes.filter { $0.date ?? Date() >= startDate }
        case "This Year":
            let startOfYear = calendar.date(from: calendar.dateComponents([.year], from: now))!
            filtered = incomes.filter { $0.date ?? Date() >= startOfYear }
        default:
            filtered = Array(incomes)
        }
        
        return filtered
    }
    
    var totalIncome: Double {
        filteredIncomes.reduce(0) { $0 + $1.amount }
    }
    
    var averageMonthlyIncome: Double {
        guard !filteredIncomes.isEmpty else { return 0 }
        let calendar = Calendar.current
        let now = Date()
        let oldestDate = filteredIncomes.last?.date ?? now
        let months = max(1, calendar.dateComponents([.month], from: oldestDate, to: now).month ?? 1)
        return totalIncome / Double(months)
    }
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Income Summary Card
                    VStack(spacing: 15) {
                        Picker("Period", selection: $selectedPeriod) {
                            ForEach(periods, id: \.self) { period in
                                Text(period).tag(period)
                            }
                        }
                        .pickerStyle(.segmented)
                        
                        HStack(spacing: 20) {
                            VStack(alignment: .leading) {
                                Text("Total Income")
                                    .font(.caption)
                                    .foregroundColor(.gray)
                                Text("$\(totalIncome, specifier: "%.2f")")
                                    .font(.headline)
                            }
                            
                            Divider()
                            
                            VStack(alignment: .leading) {
                                Text("Monthly Average")
                                    .font(.caption)
                                    .foregroundColor(.gray)
                                Text("$\(averageMonthlyIncome, specifier: "%.2f")")
                                    .font(.headline)
                            }
                        }
                    }
                    .padding()
                    .background(Color(UIColor.systemBackground))
                    .cornerRadius(15)
                    .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
                    
                    // Income List
                    VStack(alignment: .leading, spacing: 15) {
                        HStack {
                            Text("💵 Income History")
                                .font(.title3)
                                .bold()
                            Spacer()
                            Button(action: { showingAddIncome = true }) {
                                Label("Add", systemImage: "plus.circle.fill")
                                    .font(.subheadline)
                                    .foregroundColor(.blue)
                                    .padding(8)
                                    .background(Color.blue.opacity(0.1))
                                    .cornerRadius(8)
                            }
                        }
                        
                        if filteredIncomes.isEmpty {
                            EmptyIncomeView()
                        } else {
                            ForEach(filteredIncomes) { income in
                                IncomeCard(income: income)
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
            .navigationTitle("Income")
            .navigationBarItems(
                leading: Button("Done") {
                    dismiss()
                }
            )
            .sheet(isPresented: $showingAddIncome) {
                AddIncomeView()
            }
        }
    }
}

struct IncomeCard: View {
    let income: Income
    @Environment(\.managedObjectContext) private var viewContext
    @State private var showingEditSheet = false
    
    var icon: String {
        switch income.source?.lowercased() {
        case "salary": return "💼"
        case "freelance": return "💻"
        case "investment": return "📈"
        case "rental": return "🏠"
        case "business": return "🏢"
        case "other": return "💰"
        default: return "💵"
        }
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("\(icon) \(income.name ?? "")")
                    .font(.headline)
                Spacer()
                Button(action: { showingEditSheet = true }) {
                    Image(systemName: "pencil.circle.fill")
                        .foregroundColor(.blue)
                }
            }
            
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("Amount:")
                        .foregroundColor(.gray)
                    Text("$\(income.amount, specifier: "%.2f")")
                        .bold()
                        .foregroundColor(.green)
                }
                
                HStack {
                    Text("Source:")
                        .foregroundColor(.gray)
                    Text(income.source ?? "Other")
                }
                
                HStack {
                    Text("Date:")
                        .foregroundColor(.gray)
                    Text(income.date ?? Date(), style: .date)
                }
                
                if income.isRecurring {
                    HStack {
                        Image(systemName: "repeat.circle.fill")
                            .foregroundColor(.blue)
                        Text("\(income.recurringFrequency ?? "Monthly") Income")
                            .foregroundColor(.blue)
                    }
                }
                
                if let notes = income.notes, !notes.isEmpty {
                    Text(notes)
                        .font(.caption)
                        .foregroundColor(.gray)
                        .lineLimit(2)
                }
            }
        }
        .padding()
        .background(Color(UIColor.secondarySystemBackground))
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .strokeBorder(Color.green.opacity(0.3), lineWidth: 1)
        )
        .sheet(isPresented: $showingEditSheet) {
            EditIncomeView(income: income)
        }
    }
}

struct EmptyIncomeView: View {
    var body: some View {
        VStack(spacing: 15) {
            Image(systemName: "dollarsign.circle.fill")
                .font(.system(size: 40))
                .foregroundColor(.blue)
            Text("No income recorded")
                .font(.headline)
                .foregroundColor(.gray)
            Text("Add your income to track your earnings")
                .font(.subheadline)
                .foregroundColor(.gray)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 30)
        .background(Color.blue.opacity(0.05))
        .cornerRadius(15)
    }
}

struct AddIncomeView: View {
    @Environment(\.managedObjectContext) private var viewContext
    @Environment(\.dismiss) private var dismiss
    
    @State private var name = ""
    @State private var amount = ""
    @State private var source = "Salary"
    @State private var date = Date()
    @State private var notes = ""
    @State private var isRecurring = false
    @State private var recurringFrequency = "Monthly"
    
    let sources = ["Salary", "Freelance", "Investment", "Rental", "Business", "Other"]
    let frequencies = ["Weekly", "Fortnightly", "Monthly", "Quarterly", "Yearly"]
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Income Details")) {
                    TextField("Name", text: $name)
                    TextField("Amount", text: $amount)
                        .keyboardType(.decimalPad)
                    
                    Picker("Source", selection: $source) {
                        ForEach(sources, id: \.self) { source in
                            Text(source).tag(source)
                        }
                    }
                    
                    DatePicker("Date", selection: $date, displayedComponents: .date)
                }
                
                Section(header: Text("Recurring Income")) {
                    Toggle("Is Recurring", isOn: $isRecurring)
                    
                    if isRecurring {
                        Picker("Frequency", selection: $recurringFrequency) {
                            ForEach(frequencies, id: \.self) { frequency in
                                Text(frequency).tag(frequency)
                            }
                        }
                    }
                }
                
                Section(header: Text("Additional Notes")) {
                    TextEditor(text: $notes)
                        .frame(height: 100)
                }
            }
            .navigationTitle("Add Income")
            .navigationBarItems(
                leading: Button("Cancel") {
                    dismiss()
                },
                trailing: Button("Save") {
                    saveIncome()
                }
            )
        }
    }
    
    private func saveIncome() {
        guard let amountDouble = Double(amount), !name.isEmpty else { return }
        
        IncomeManager.shared.createIncome(
            name: name,
            amount: amountDouble,
            source: source,
            date: date,
            notes: notes,
            isRecurring: isRecurring,
            recurringFrequency: isRecurring ? recurringFrequency : nil,
            in: viewContext
        )
        
        dismiss()
    }
}

struct EditIncomeView: View {
    @Environment(\.managedObjectContext) private var viewContext
    @Environment(\.dismiss) private var dismiss
    let income: Income
    
    @State private var name: String
    @State private var amount: String
    @State private var source: String
    @State private var date: Date
    @State private var notes: String
    @State private var isRecurring: Bool
    @State private var recurringFrequency: String
    
    let sources = ["Salary", "Freelance", "Investment", "Rental", "Business", "Other"]
    let frequencies = ["Weekly", "Fortnightly", "Monthly", "Quarterly", "Yearly"]
    
    init(income: Income) {
        self.income = income
        _name = State(initialValue: income.name ?? "")
        _amount = State(initialValue: String(income.amount))
        _source = State(initialValue: income.source ?? "Salary")
        _date = State(initialValue: income.date ?? Date())
        _notes = State(initialValue: income.notes ?? "")
        _isRecurring = State(initialValue: income.isRecurring)
        _recurringFrequency = State(initialValue: income.recurringFrequency ?? "Monthly")
    }
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Income Details")) {
                    TextField("Name", text: $name)
                    TextField("Amount", text: $amount)
                        .keyboardType(.decimalPad)
                    
                    Picker("Source", selection: $source) {
                        ForEach(sources, id: \.self) { source in
                            Text(source).tag(source)
                        }
                    }
                    
                    DatePicker("Date", selection: $date, displayedComponents: .date)
                }
                
                Section(header: Text("Recurring Income")) {
                    Toggle("Is Recurring", isOn: $isRecurring)
                    
                    if isRecurring {
                        Picker("Frequency", selection: $recurringFrequency) {
                            ForEach(frequencies, id: \.self) { frequency in
                                Text(frequency).tag(frequency)
                            }
                        }
                    }
                }
                
                Section(header: Text("Additional Notes")) {
                    TextEditor(text: $notes)
                        .frame(height: 100)
                }
                
                Section {
                    Button("Delete Income", role: .destructive) {
                        deleteIncome()
                    }
                }
            }
            .navigationTitle("Edit Income")
            .navigationBarItems(
                leading: Button("Cancel") {
                    dismiss()
                },
                trailing: Button("Save") {
                    updateIncome()
                }
            )
        }
    }
    
    private func updateIncome() {
        guard let amountDouble = Double(amount) else { return }
        
        withAnimation {
            income.name = name
            income.amount = amountDouble
            income.source = source
            income.date = date
            income.notes = notes
            income.isRecurring = isRecurring
            income.recurringFrequency = isRecurring ? recurringFrequency : nil
            
            do {
                try viewContext.save()
                dismiss()
            } catch {
                let nsError = error as NSError
                fatalError("Unresolved error \(nsError), \(nsError.userInfo)")
            }
        }
    }
    
    private func deleteIncome() {
        withAnimation {
            viewContext.delete(income)
            do {
                try viewContext.save()
                dismiss()
            } catch {
                let nsError = error as NSError
                fatalError("Unresolved error \(nsError), \(nsError.userInfo)")
            }
        }
    }
}

#Preview {
    IncomeView()
        .environment(\.managedObjectContext, PersistenceController.shared.container.viewContext)
} 