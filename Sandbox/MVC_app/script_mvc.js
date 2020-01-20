
class Model {
    constructor(){
        
        this.todos = JSON.parse(localStorage.getItem('todos')) || []
        
        //The state of the model, array of to-do objects, prepopulated with some data
        // this.todos = [
        //     {id: 1, text:"Go to the GYM", complete: false},
        //     {id: 2, text:"Visit El Pariente & eat tacos", complete: false}
        // ]
    }

    _commit(todos){
        this.onTodoListChanged(todos)
        localStorage.setItem('todos', JSON.stringify(todos))
    }

    bindTodoListChanged(callback){
        this.onTodoListChanged = callback
    }

    addTodo(todoText){
        const todo = {
            id: this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1 : 1,
            text: todoText,
            complete: false,  
        }
        this.todos.push(todo)
        this.onTodoListChanged(this.todos)
        this._commit(this.todos)
    }

    //Map through all todos and replace the text of the todo with specified id | IOW --> Edit the "todo"
    editTodo(id, updatedText){
        this.todos = this.todos.map(todo =>
        todo.id === id ? {id: todo.id, text: updatedText, complete: todo.complete} : todo
        )
        this.onTodoListChanged(this.todos)
        this._commit(this.todos)
    }

    //Filter a todo out of the array bi id
    deleteTodo(id){
        this.todos = this.todos.filter(todo => todo.id !== id)

        this.onTodoListChanged(this.todos)
        this._commit(this.todos)
    }

    //Flip the complete boolean on the specific todo
    toggleTodo(id){
        this.todos = this.todos.map(todo =>
        todo.id === id ? {id: todo.id, text: todo.text,  complete: !todo.complete} : todo
        )
        this.onTodoListChanged(this.todos)
        this._commit(this.todos)
    }

}

class View {
    constructor(){

        //The root element
        this.app = this.getElement('#root')

        //The title of the app
        this.title = this.createElement('h1')
        this.title.textContent = "Tasks to-do"

        //The form, with a [type="text"] input, and a submit button
        this.form = this.createElement('form')

        this.input = this.createElement('input')
        this.input.type = 'text'
        this.input.placeholder = 'Add some task to-do'
        this.input.name = 'to-do'

        this.submitButton = this.createElement('button')
        this.submitButton.textContent = 'Submit'

        //The visual representation of the to-do list
        this.todoList = this.createElement('ul', 'todo-list')

        //Append the input and submit button to the form
        this.form.append(this.input, this.submitButton)

        //Append the title, form and to-do list to the app
        this.app.append(this.title, this.form, this.todoList)

        this._temporaryTodoText
        this._initLocalListeners()
    }

    //For the editTodo feature

    //Update temporary state
    _initLocalListeners(){
        this.todoList.addEventListener('input', event => {
            if(event.target.className === 'editable'){
                this._temporaryTodoText = event.target.innerText
            }
        })
    }

    //Send the completed value to the model
    bindEditTodo(handler){
        this.todoList.addEventListener('focusout', event => {
            if (this._temporaryTodoText){
                const id = parseInt(event.target.parentElement.id)

                handler(id, this._temporaryTodoText)
                this._temporaryTodoText = ''
            }
        })
    }

    get _todoText(){
        return this.input.value
    }

    _resetInput(){
        this.input.value = ''
    }

    //Create an element with an optional CSS class
    createElement(tag, className){
        const element = document.createElement(tag)
            if (className) element.classList.add(className)
            
            return element
    }

    //Retrieve an element from the DOM
    getElement(selector){
        const element = document.querySelector(selector)

        return element
    }

    displayTodos(todos){
        //Delete all nodes
        while(this.todoList.firstChild){
            this.todoList.removeChild(this.todoList.firstChild)
        }

        //Show default message
        if (todos.lenght == 0){
            const p = this.createElement('p')
            p.textContent = "Nothing to do! Do you want to add a task?"
            this.todoList.append(p)
        } else { // Create nodes
            todos.forEach(todo => {
                const li = this.createElement('li')
                li.id = todo.id

                //Each todo item will have a checkbox you can toogle
                const checkbox = this.createElement('input')
                checkbox.type = 'checkbox'
                checkbox.checked = todo.complete

                //The todo item text will be in a content editable span
                const span = this.createElement('span')
                span.contentEditable = true
                span.classList.add('editable')

                //If the todo is complete, it will have a strikethrough
                if(todo.complete){
                    const strike = this.createElement('s')
                    strike.textContent = todo.text
                    span.append(strike)
                } else { //Otherwise just display the text
                    span.textContent = todo.text
                }

                // Todos will have a delete button
                const deleteButton = this.createElement('button', 'delete')
                deleteButton.textContent = 'Delete'
                li.append(checkbox, span, deleteButton)

                //Append nodes to the todo list
                this.todoList.append(li)
            })
        }
    } 
    
    bindAddTodo(handler){
        this.form.addEventListener('submit', event => {
            event.preventDefault()

            if(this._todoText){
                handler(this._todoText)
                this._resetInput
            }
        })
    }


    bindDeleteTodo(handler){
        this.todoList.addEventListener('click', event => {
            if(event.target.className === 'delete'){
                const id = parseInt(event.target.parentElement.id)

                handler(id)
            
            }
        })
    }

    bindToggleTodo(handler){
        this.todoList.addEventListener('change', event => {
            if(event.target.type === 'checkbox'){
                const id = parseInt(event.target.parentElement.id)

                handler(id)
            }
        })
    }
}

class Controller {
    constructor(model, view){
        this.model = model
        this.view = view

    //Explicit -this- binding
    this.view.bindAddTodo(this.handleAddTodo)
    this.view.bindEditTodo(this.handleEditTodo)
    this.view.bindDeleteTodo(this.handleDeleteTodo)
    this.view.bindToggleTodo(this.handleToggleTodo)

    this.model.bindTodoListChanged(this.onTodoListChanged)

    //Display initial todos
    this.onTodoListChanged(this.model.todos)
    }

    onTodoListChanged = todos => {
        this.view.displayTodos(todos)
    }

    handleAddTodo = todoText => {
        this.model.addTodo(todoText)
    }

    handleEditTodo = (id, todoText) => {
        this.model.editTodo(id, todoText)
    }

    handleDeleteTodo = (id) => {
        this.model.deleteTodo(id)
    }

    handleToggleTodo = (id) => {
        this.model.toggleTodo(id)
    }
}



const app = new Controller (new Model(), new View())

