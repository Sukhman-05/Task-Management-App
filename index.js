// Define Task Model
var Task = Backbone.Model.extend({
    defaults: {
        title: '',
        description: '',
        completed: false
    }
});

// Define Task Collection
var TaskCollection = Backbone.Collection.extend({
    model: Task,
    localStorage: new Backbone.LocalStorage("tasks")
});

// Instantiate Collection
var taskList = new TaskCollection();

// Define Task View
var TaskView = Backbone.View.extend({
    tagName: 'li',
    template: _.template($('#task-template').html()),
    events: {
        'click .edit': 'editTask',
        'click .delete': 'deleteTask',
        'change .toggle': 'toggleCompleted'
    },
    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },
    editTask: function () {
        var newTitle = prompt("Edit title:", this.model.get('title'));
        var newDesc = prompt("Edit description:", this.model.get('description'));
        if (newTitle) this.model.set('title', newTitle);
        if (newDesc) this.model.set('description', newDesc);
        this.model.save();
        this.render();
    },
    deleteTask: function () {
        this.model.destroy();
        this.remove();
    },
    toggleCompleted: function () {
        this.model.set('completed', !this.model.get('completed'));
        this.model.save();
        this.render();
    }
});

// Define App View
var AppView = Backbone.View.extend({
    el: '#app',
    events: {
        'submit #task-form': 'addTask',
        'click #filter-all': 'filterAll',
        'click #filter-active': 'filterActive',
        'click #filter-completed': 'filterCompleted'
    },
    initialize: function () {
        console.log('AppView initialized');
        this.listenTo(taskList, 'add', this.renderTask);
        this.listenTo(taskList, 'reset', this.renderAll);
        taskList.fetch({ success: () => console.log('Fetched tasks:', taskList.toJSON()) });
    },
    addTask: function (e) {
        e.preventDefault();
        console.log('Form submit prevented');
        var title = $('#task-title').val().trim();
        var description = $('#task-desc').val().trim();
        if (title) {
            taskList.create({ title: title, description: description }, {
                success: () => console.log('Task created:', taskList.toJSON()),
                error: (model, err) => console.error('Creation failed:', err)
            });
            $('#task-title').val('');
            $('#task-desc').val('');
        } else {
            console.log('No title provided');
        }
    },
    renderTask: function (task) {
        console.log('Rendering task:', task.toJSON());
        var view = new TaskView({ model: task });
        $('#task-list').append(view.render().el);
    },
    renderAll: function () {
        console.log('Rendering all tasks');
        $('#task-list').empty();
        taskList.each(this.renderTask, this);
    },
    filterAll: function () {
        this.renderAll();
    },
    filterActive: function () {
        this.renderFiltered(false);
    },
    filterCompleted: function () {
        this.renderFiltered(true);
    },
    renderFiltered: function (completedStatus) {
        $('#task-list').empty();
        taskList.each(function (task) {
            if (task.get('completed') === completedStatus) {
                this.renderTask(task);
            }
        }, this);
    }
});

// Initialize App
$(function () {
    new AppView();
});