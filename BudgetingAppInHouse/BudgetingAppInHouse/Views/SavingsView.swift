import SwiftUI
import CoreData

struct SavingsView: View {
    @Environment(\.managedObjectContext) private var viewContext
    @FetchRequest(
        sortDescriptors: [NSSortDescriptor(keyPath: \SavingsGoal.name, ascending: true)],
        animation: .default)
    private var savingsGoals: FetchedResults<SavingsGoal>
    
    @State private var showingAddGoal = false
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Total Savings Summary
                VStack(spacing: 15) {
                    HStack {
                        Text("🎯 Total Savings")
                            .font(.title2)
                            .bold()
                        Spacer()
                    }
                    
                    HStack(spacing: 30) {
                        VStack(spacing: 5) {
                            Text("Current")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                            Text("$\(totalCurrentAmount, specifier: "%.2f")")
                                .font(.title)
                                .bold()
                                .foregroundColor(.blue)
                        }
                        
                        VStack(spacing: 5) {
                            Text("Target")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                            Text("$\(totalTargetAmount, specifier: "%.2f")")
                                .font(.title)
                                .bold()
                                .foregroundColor(.green)
                        }
                    }
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(Color(UIColor.secondarySystemBackground))
                    .cornerRadius(12)
                }
                .padding()
                .background(Color(UIColor.systemBackground))
                .cornerRadius(15)
                .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
                
                // Savings Goals
                VStack(alignment: .leading, spacing: 15) {
                    HStack {
                        Text("💰 Savings Goals")
                            .font(.title2)
                            .bold()
                        Spacer()
                        Button(action: { showingAddGoal = true }) {
                            Label("Add Goal", systemImage: "plus.circle.fill")
                                .font(.subheadline)
                                .foregroundColor(.blue)
                                .padding(8)
                                .background(Color.blue.opacity(0.1))
                                .cornerRadius(8)
                        }
                    }
                    
                    if savingsGoals.isEmpty {
                        VStack(spacing: 15) {
                            Image(systemName: "star.circle.fill")
                                .font(.system(size: 40))
                                .foregroundColor(.blue)
                            Text("No savings goals yet")
                                .font(.headline)
                                .foregroundColor(.gray)
                            Button(action: { showingAddGoal = true }) {
                                Text("Create your first goal")
                                    .font(.subheadline)
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 20)
                                    .padding(.vertical, 10)
                                    .background(Color.blue)
                                    .cornerRadius(10)
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 30)
                        .background(Color.blue.opacity(0.05))
                        .cornerRadius(15)
                    } else {
                        ForEach(savingsGoals) { goal in
                            SavingsGoalRow(goal: goal)
                        }
                        .onDelete(perform: deleteGoals)
                    }
                }
                .padding()
                .background(Color(UIColor.systemBackground))
                .cornerRadius(15)
                .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
            }
            .padding()
        }
        .navigationTitle("Savings")
        .sheet(isPresented: $showingAddGoal) {
            AddSavingsGoalView()
        }
    }
    
    private var totalCurrentAmount: Double {
        savingsGoals.reduce(0) { $0 + $1.currentAmount }
    }
    
    private var totalTargetAmount: Double {
        savingsGoals.reduce(0) { $0 + $1.targetAmount }
    }
    
    private func deleteGoals(offsets: IndexSet) {
        withAnimation {
            offsets.map { savingsGoals[$0] }.forEach(viewContext.delete)
            do {
                try viewContext.save()
            } catch {
                let nsError = error as NSError
                fatalError("Unresolved error \(nsError), \(nsError.userInfo)")
            }
        }
    }
}

struct SavingsGoalRow: View {
    let goal: SavingsGoal
    @State private var showingAddProgress = false
    @State private var showingEditGoal = false
    
    var progress: Double {
        guard goal.targetAmount > 0 else { return 0 }
        return min(goal.currentAmount / goal.targetAmount, 1.0)
    }
    
    var remainingAmount: Double {
        max(goal.targetAmount - goal.currentAmount, 0)
    }
    
    var color: Color {
        if progress >= 0.9 { return .green }
        if progress >= 0.5 { return .blue }
        return .orange
    }
    
    var icon: String {
        switch goal.name?.lowercased() {
        case let name where name?.contains("emergency") ?? false: return "🚨"
        case let name where name?.contains("house") ?? false: return "🏠"
        case let name where name?.contains("car") ?? false: return "🚗"
        case let name where name?.contains("holiday") ?? false: return "✈️"
        case let name where name?.contains("education") ?? false: return "📚"
        default: return "🎯"
        }
    }
    
    var body: some View {
        VStack(spacing: 12) {
            HStack {
                Text(icon)
                    .font(.title2)
                VStack(alignment: .leading) {
                    Text(goal.name ?? "")
                        .font(.headline)
                    if let deadline = goal.deadline {
                        Text("Due: \(deadline, style: .date)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                Spacer()
                Menu {
                    Button(action: { showingAddProgress = true }) {
                        Label("Add Progress", systemImage: "plus.circle")
                    }
                    Button(action: { showingEditGoal = true }) {
                        Label("Edit Goal", systemImage: "pencil")
                    }
                } label: {
                    Image(systemName: "ellipsis.circle.fill")
                        .foregroundColor(.blue)
                        .font(.title3)
                }
            }
            
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text("Progress:")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    Spacer()
                    Text("$\(goal.currentAmount, specifier: "%.2f") / $\(goal.targetAmount, specifier: "%.2f")")
                        .font(.system(size: 16, weight: .bold))
                }
                
                ProgressView(value: progress)
                    .tint(color)
                    .background(Color.gray.opacity(0.2))
                    .scaleEffect(x: 1, y: 1.5, anchor: .center)
                
                Text("Remaining: $\(remainingAmount, specifier: "%.2f")")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(Color(UIColor.secondarySystemBackground))
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .strokeBorder(color.opacity(0.3), lineWidth: 1)
        )
        .sheet(isPresented: $showingAddProgress) {
            AddProgressView(goal: goal)
        }
        .sheet(isPresented: $showingEditGoal) {
            EditSavingsGoalView(goal: goal)
        }
    }
}

struct AddSavingsGoalView: View {
    @Environment(\.managedObjectContext) private var viewContext
    @Environment(\.dismiss) private var dismiss
    
    @State private var name: String = ""
    @State private var targetAmount: String = ""
    @State private var currentAmount: String = ""
    @State private var hasDeadline: Bool = false
    @State private var deadline: Date = Date().addingTimeInterval(30*24*60*60)
    
    var body: some View {
        NavigationView {
            Form {
                Section {
                    TextField("Target Amount", text: $targetAmount)
                        .keyboardType(.decimalPad)
                        .font(.system(size: 34, weight: .bold))
                        .multilineTextAlignment(.center)
                        .padding(.vertical)
                }
                .listRowBackground(Color.clear)
                
                Section(header: Text("Goal Details").textCase(.uppercase)) {
                    TextField("Goal Name", text: $name)
                    TextField("Current Progress", text: $currentAmount)
                        .keyboardType(.decimalPad)
                }
                
                Section(header: Text("Deadline").textCase(.uppercase)) {
                    Toggle("Set Deadline", isOn: $hasDeadline)
                    if hasDeadline {
                        DatePicker("Target Date", selection: $deadline, displayedComponents: .date)
                    }
                }
            }
            .navigationTitle("New Savings Goal")
            .navigationBarItems(
                leading: Button("Cancel") {
                    dismiss()
                },
                trailing: Button("Save") {
                    saveGoal()
                }
                .disabled(name.isEmpty || targetAmount.isEmpty)
            )
        }
    }
    
    private func saveGoal() {
        guard let targetAmountDouble = Double(targetAmount),
              let currentAmountDouble = Double(currentAmount),
              !name.isEmpty else { return }
        
        withAnimation {
            let newGoal = SavingsGoal(context: viewContext)
            newGoal.id = UUID()
            newGoal.name = name
            newGoal.targetAmount = targetAmountDouble
            newGoal.currentAmount = currentAmountDouble
            newGoal.deadline = hasDeadline ? deadline : nil
            
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

struct EditSavingsGoalView: View {
    @Environment(\.managedObjectContext) private var viewContext
    @Environment(\.dismiss) private var dismiss
    let goal: SavingsGoal
    
    @State private var name: String
    @State private var targetAmount: String
    @State private var hasDeadline: Bool
    @State private var deadline: Date
    
    init(goal: SavingsGoal) {
        self.goal = goal
        _name = State(initialValue: goal.name ?? "")
        _targetAmount = State(initialValue: String(goal.targetAmount))
        _hasDeadline = State(initialValue: goal.deadline != nil)
        _deadline = State(initialValue: goal.deadline ?? Date())
    }
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Goal Details").textCase(.uppercase)) {
                    TextField("Goal Name", text: $name)
                    TextField("Target Amount", text: $targetAmount)
                        .keyboardType(.decimalPad)
                }
                
                Section(header: Text("Deadline").textCase(.uppercase)) {
                    Toggle("Set Deadline", isOn: $hasDeadline)
                    if hasDeadline {
                        DatePicker("Target Date", selection: $deadline, displayedComponents: .date)
                    }
                }
                
                Section {
                    Button("Delete Goal", role: .destructive) {
                        deleteGoal()
                    }
                }
            }
            .navigationTitle("Edit Goal")
            .navigationBarItems(
                leading: Button("Cancel") {
                    dismiss()
                },
                trailing: Button("Save") {
                    updateGoal()
                }
                .disabled(name.isEmpty || targetAmount.isEmpty)
            )
        }
    }
    
    private func updateGoal() {
        guard let targetAmountDouble = Double(targetAmount) else { return }
        
        withAnimation {
            goal.name = name
            goal.targetAmount = targetAmountDouble
            goal.deadline = hasDeadline ? deadline : nil
            
            do {
                try viewContext.save()
                dismiss()
            } catch {
                let nsError = error as NSError
                fatalError("Unresolved error \(nsError), \(nsError.userInfo)")
            }
        }
    }
    
    private func deleteGoal() {
        withAnimation {
            viewContext.delete(goal)
            
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

struct AddProgressView: View {
    @Environment(\.managedObjectContext) private var viewContext
    @Environment(\.dismiss) private var dismiss
    let goal: SavingsGoal
    
    @State private var amount: String = ""
    
    var body: some View {
        NavigationView {
            Form {
                Section {
                    TextField("Amount", text: $amount)
                        .keyboardType(.decimalPad)
                        .font(.system(size: 34, weight: .bold))
                        .multilineTextAlignment(.center)
                        .padding(.vertical)
                }
                .listRowBackground(Color.clear)
                
                Section {
                    HStack {
                        Text("Current Progress")
                        Spacer()
                        Text("$\(goal.currentAmount, specifier: "%.2f")")
                            .bold()
                    }
                    HStack {
                        Text("Target Amount")
                        Spacer()
                        Text("$\(goal.targetAmount, specifier: "%.2f")")
                            .bold()
                    }
                }
            }
            .navigationTitle("Add Progress")
            .navigationBarItems(
                leading: Button("Cancel") {
                    dismiss()
                },
                trailing: Button("Save") {
                    updateProgress()
                }
                .disabled(amount.isEmpty)
            )
        }
    }
    
    private func updateProgress() {
        guard let amountDouble = Double(amount) else { return }
        
        withAnimation {
            goal.currentAmount += amountDouble
            
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
    SavingsView()
        .environment(\.managedObjectContext, PersistenceController.shared.container.viewContext)
} 