//
//  BudgetingAppInHouseApp.swift
//  BudgetingAppInHouse
//
//  Created by Maemeenoi Sainui on 20/01/2025.
//

import SwiftUI
import CoreData

@main
struct BudgetingAppInHouseApp: App {
    let persistenceController = PersistenceController.shared
    @AppStorage("darkModeEnabled") private var darkModeEnabled = false
    
    var body: some Scene {
        WindowGroup {
            MainTabView()
                .environment(\.managedObjectContext, persistenceController.container.viewContext)
                .preferredColorScheme(darkModeEnabled ? .dark : .light)
        }
    }
}

// Persistence Controller for Core Data
class PersistenceController {
    static let shared = PersistenceController()
    
    let container: NSPersistentContainer
    
    init() {
        container = NSPersistentContainer(name: "BudgetingAppInHouse")
        
        container.loadPersistentStores { (storeDescription, error) in
            if let error = error as NSError? {
                fatalError("Unresolved error \(error), \(error.userInfo)")
            }
        }
        
        container.viewContext.automaticallyMergesChangesFromParent = true
    }
}

