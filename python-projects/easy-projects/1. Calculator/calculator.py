#Calculator

#1. Display a menu for the user to select an operation (addition, subtraction, multiplication, division).
def display_menu():
    print('Select an operation: ')
    print('1. Addition (+)')
    print('2. Subtract (-)')
    print('3. Multiply (X)')
    print('4. Divide (/)')
#2. Prompt the user to input two numbers.
def get_numbers():
    num1 = float(input("Enter your first number: "))
    num2 = float(input("Enter your second number: "))
    return num1,num2

#3. Based on the selected operation, perform the corresponding arithmetic calculation:
def calculator():
    while True:
        display_menu()
        choice = input("Enter choice (1/2/3/4): ")
        if choice in ('1', '2', '3', '4'):
            num1, num2 = get_numbers()
            #4. If addition, add the two numbers.
            if choice == '1':
                print(f'The result is: {num1 + num2}')
            #If subtraction, subtract the second number from the first.
            elif choice == '2':
                print(f'The result is: {num1 - num2}')  
            #If multiplication, multiply the two numbers.            
            elif choice == '3':
                print(f'The result is: {num1 * num2}')
            #If division, divide the first number by the second (check for division by zero).
            elif choice == '4':
                if num2 != 0:
                    print(f'The result is: {num1 / num2}')
                else:
                    print("You can't devided by Zero (0)")
            else:
                print("Wrong choices try again")
            #6. Ask the user if they want to perform another calculation or exit the program.
            caculate_again = input("Do you want to calculate again? Type Y/N : ")
            if caculate_again.lower() != 'y':
                break

if __name__ == "__main__":
    calculator()


                







           




