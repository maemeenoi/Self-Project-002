#To-Do List
#Display a menu with options to add a task, view all tasks, delete a task, or exit the application.
task_list = []
def menu_display():
    print('1. Add Task')
    print('2. View Task')
    print('3. Delete Task')
    print('4. Exit')

def todo_lists():
    while True:
        menu_display()
        choice = input('Enter your choice (1/2/3/4)')
        #If the user selects 'add a task':
        if choice == '1':
            task_input = input("Please type in your task!: ")
            task_list.append(task_input)
            print(f"Task: {task_input} has been added!")
        #If the user selects 'view all tasks':
        elif choice == '2':
            if task_list != []:
                for number, task in enumerate(task_list):
                    print((number + 1), task)
                print("That's all the tasks!")
            else:
                print("No Task here, please press 1 to add the task!")
        #If the user selects 'delete a task':
        elif choice == '3':
            if task_list != []:
                num_delete = int(input("Which task do you want to delete? Please choose the number: "))
                task_list.pop(num_delete - 1)
                print(f'Task number: {num_delete} has been deleted! here what is left.')
                for number, task in enumerate(task_list):
                    print((number + 1), task)
            else:
                print("No Task here, please press 1 to add the task!")
        #Repeat the menu until the user chooses to exit the application.
        elif choice == '4':
            print("Bye!")
            break
        else: 
            print ("That's a wrong choice! Try again")

todo_lists() 

        
