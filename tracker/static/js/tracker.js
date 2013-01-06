/* The app */
var App = {
    Models: {},
    Views: {},
    Collections: {},
    Routers: {}
}

/* A close prototype for views so we can clean them up */
Backbone.View.prototype.close = function() {
    this.undelegateEvents();
    this.empty;
    this.unbind();
    if (this.onClose) {
        this.onClose();
    }
}

/* Project Model
   - title: The title of the project
   - started: When the project was started, defaults to today
   - completed: When the project was complete defaults to null
   - active: Whether the project is being worked on
*/
App.Models.Project = Backbone.Model.extend({
    defaults:{
        title: '',
        estimate: '',
        started: new Date().toDateString(),
        completed: null,
        active: true,
    },
});


// Project Collection.... self explanitory
App.Collections.ProjectCollection = Backbone.Collection.extend({
    model: App.Models.Project
});

/* CreateView
 * renders the create project view
 * creates new project Models and Views
 */
App.Views.CreateView = Backbone.View.extend({
    el: '#creator',

    template: _.template($('#creator-view-template').html()),

    initialize: function() {
        this.render();
    },

    render: function() {
        this.$el.html(this.template());
    },

    events: {
        'click button[id=create]': 'createProject',
    },

    /* createProject
     * create a new Project with the name and estimation
     */
    createProject: function(event) {
        // get input values
        p_name = $('#pname').val();
        p_estimate = $('#pestimate').val();
        // add the new project
        App.Projects.add(new App.Models.Project({ title: p_name, estimate: p_estimate }));
        // clear out inputs
        $('#pname').val(''); 
        $('#pestimate').val(''); 
    },
});


/* ProjectView 
   - renders each project view 
   - takes a project model
*/
App.Views.ProjectView = Backbone.View.extend({
    el: '#project-container',

    template: _.template( $('#project-view-template').html() ),
    
    // When initialized, render my html
    initialize: function() {
        this.model.bind('change', this.render, this);
        this.render();
    },

    // Render me with my models information
    render: function() {
        this.$el.html( this.template( this.model.toJSON() ) );
    },

    events: {
        'click button[id=inactive]': 'deactivateProject',
        'click button[id=active]': 'activateProject',
        'click button[id=finish]': 'finishProject'
    },
    
    /* activateProject
        - I set my model's active status to false
    */
    activateProject: function( event ) {
        this.model.set({active: true});
    },

    /* deactivateProject
        - I set my model's active status to false
    */
    deactivateProject: function( event ) {
        this.model.set({active: false});
    },
    
    /* finishProject
        - I set my model's completed attribute to the day the button was clicked
    */
    finishProject: function( event ) {
        this.model.set({completed: new Date().toDateString()});
    },   

    /* onClose
        - I close out the view correctly
    */
    onClose: function( event ) {
        this.model.unbind('change', this.render);
    }

});

/* ListView
    - render a list of options that you can select
    - takes a collection of projects
*/
App.Views.ListView = Backbone.View.extend({
    el: '#project-list',

    initialize: function() {
        this.options = []
        this.collection.bind('add', this.render, this);
        this.render();
    },

    render: function() {
        // If I already have options, I need to close them out and re render
        if(this.options.length > 0){
            this.close();
        }
        // For each model in the collection, make an option for them
        _.each(this.collection.models, function(proj) {
            option_view = new App.Views.OptionView({model: proj});
            this.options.push(option_view);
            this.$el.append(option_view.render());
        }, this);
    },

    /* onClose
        - I close out my old children views, so i can apporpriatly re-render
    */
    onClose: function( event ) {
        _.each(this.options, function(opts){
            opts.close();
        }, this);
        this.options = []
    }

});

/* ListOption

    - render an option view
    - takes a project model?
*/
App.Views.OptionView = Backbone.View.extend({
    template : _.template( $('#option-template').html() ),

    initialize: function() {
    },

    render: function() {
        return this.$el.html( this.template( this.model.toJSON() ) );
    },

    events: {
        'click button': 'selectProject',
    },

    /* finishProject
        - I select a project from the list and update that projects view
    */
    selectProject: function( event ) {
        // Close out the current ProjectView and create a new one
        App.TrackerView.close()
        App.TrackerView = new App.Views.ProjectView({ model: this.model });
    },
    
    /* onClose
        - this has to use remove() as opposed to empty to remove the
          element completly from the DOM
    */
    onClose: function( event ) {
        this.remove();
    }
});


// DOM stuff
$(function() {
    // create some projects
    App.ProjectOne = new App.Models.Project({ title: 'First Project', estimate: 5});
    App.ProjectTwo = new App.Models.Project({ title: 'Second Project', estimate: 2});

    // create the collection
    App.Projects = new App.Collections.ProjectCollection([ App.ProjectOne, App.ProjectTwo ]);

    // create the create project view
    App.Creator = new App.Views.CreateView();

    // create a Project view
    App.TrackerView = new App.Views.ProjectView({ model: App.ProjectOne });

    // create the list view
    App.ProjectList = new App.Views.ListView({ collection: App.Projects })

});
