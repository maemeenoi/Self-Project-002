//
//  ContentView.swift
//  BudgetingAppInHouse
//
//  Created by Maemeenoi Sainui on 20/01/2025.
//

import SwiftUI

struct ContentView: View {
    var body: some View {
        MainTabView()
    }
}

#Preview {
    ContentView()
        .environment(\.managedObjectContext, PersistenceController.shared.container.viewContext)
}
