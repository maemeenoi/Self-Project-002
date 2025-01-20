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
        NavigationView {
            List {
                ForEach(savingsGoals) { goal in
                    SavingsGoalRow(goal: goal)
                }
                .onDelete(perform: deleteGoals)
            }
            .navigationTitle("Savings Goals")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { showingAddGoal = true }) {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $showingAddGoal) {
                AddSavingsGoalView()
            }
        }
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
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                VStack(alignment: .leading) {
                    Text(goal.name ?? "")
                        .font(.headline)
                    if let deadline = goal.deadline {
                        Text("Target Date: \(deadline, style: .date)")
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                }
                Spacer()
                Button(action: { showingAddProgress = true }) {
                    Image(systemName: "plus.circle.fill")
                        .foregroundColor(.blue)
                }
            }
            
            ProgressView(value: progress)
                .tint(color)
            
            HStack {
                Text("$\(goal.currentAmount, specifier: "%.2f") / $\(goal.targetAmount, specifier: "%.2f")")
                    .font(.subheadline)
                Spacer()
                Text("Remaining: $\(remainingAmount, specifier: "%.2f")")
                    .font(.subheadline)
                    .foregroundColor(.gray)
            }
        }
        .padding(.vertical, 5)
        .sheet(isPresented: $showingAddProgress) {
            AddProgressView(goal: goal)
        }
    }
}

struct AddSavingsGoalView: View {
    @Environment(\.managedObjectContext) private var viewContext
    @Environment(\.dismiss) private var dismiss
    
    @State private var name: String = ""
    @State private var targetAmount: String = ""
    @State private var currentAmount: String = ""
    @State private var deadline: Date = Date().addingTimeInterval(30*24*60*60) // 30 days from now
    @State private var hasDeadline: Bool = false
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Goal Details")) {
                    TextField("Goal Name", text: $name)
                    TextField("Target Amount", text: $targetAmount)
                        .keyboardType(.decimalPad)
                    TextField("Current Amount", text: $currentAmount)
                        .keyboardType(.decimalPad)
                }
                
                Section(header: Text("Deadline")) {
                    Toggle("Set Deadline", isOn: $hasDeadline)
                    if hasDeadline {
                        DatePicker("Target Date", selection: $deadline, displayedComponents: .date)
                    }
                }
            }
            .navigationTitle("Add Savings Goal")
            .navigationBarItems(
                leading: Button("Cancel") {
                    dismiss()
                },
                trailing: Button("Save") {
                    saveGoal()
                }
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

struct AddProgressView: View {
    @Environment(\.managedObjectContext) private var viewContext
    @Environment(\.dismiss) private var dismiss
    let goal: SavingsGoal
    
    @State private var amount: String = ""
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Add Progress")) {
                    TextField("Amount", text: $amount)
                        .keyboardType(.decimalPad)
                }
                
                Section {
                    Text("Current Progress: $\(goal.currentAmount, specifier: "%.2f")")
                    Text("Target Amount: $\(goal.targetAmount, specifier: "%.2f")")
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