xBug.stores.Parser =  new Ext.data.GroupingStore({
    autoDestroy: true,
    autoLoad: false,
    url : xBug.config.connector_url,
	baseParams : {
		action : 'mgr/xbug/profile'
	},
	reader : new Ext.data.JsonReader({
		successProperty : 'success',
		totalProperty : 'total',
		root : 'parser',
		fields : [{name : 'tag'}, {name : 'outerTag'}, {name : 'processTime'}, {name : 'cacheable'}],
	}),
	groupField : 'tag',
    listeners : {
		'load' : function(store, records, opts) {
			console.log(store.reader.jsonData.profiles);
			xBug.stores.Profile.loadData({
				total : 1,
				success : true,
				profiles : store.reader.jsonData.profiles
			});
		},
        'exception' : function(misc) {
			console.log('exception');

        }
    }
});

xBug.grid.Parser  = new Ext.grid.GridPanel ({
    store: xBug.stores.Parser,
    view: new Ext.grid.GroupingView({
        forceFit: true,
		startCollapsed : true
    }),
	columns : [{header : 'Tag', dataIndex : 'tag', width : 150, fixed: true, align : 'right'},
		{header : 'outerTag', dataIndex : 'outerTag'},
		{header : 'Processing Time (S)', dataIndex : 'processTime', width: 150, fixed: true, align : 'right'},
		{header : 'cacheable', dataIndex : 'cacheable', width: 100, fixed: true, align : 'right'}],
    autoWidth: true,
    height : 400,
    frame: false,
    title: 'Parser Data',
    id : 'xbug-parser-grid',
	margins : { top: 5, right : 0, bottom : 5, left : 0}
});

xBug.stores.Profile =  new Ext.data.JsonStore({
    autoDestroy: true,
    autoLoad: false,
    url : null,
	fields : [{name : 'id'}, {name : 'duration'}, {name : 'sql'}],
	root : 'profiles',
});


xBug.grid.Profile  = new Ext.grid.GridPanel ({
    store: xBug.stores.Profile,
	columns : [{header : 'ID', dataIndex : 'id', width : 50, fixed : true, align : 'right'},
		{header : 'Duration (S)', dataIndex : 'duration', width: 100, fixed : true, align : 'right'},
		{header : 'Query', dataIndex : 'sql'}],
    autoWidth: true,
    height : 400,
    frame: false,
    title: 'SQL Profiles',
    id : 'xbug-profile-grid',
	margins : { top: 5, right : 0, bottom : 5, left : 0},
	viewConfig : {
		forceFit : true	
	}
});
xBug.panel.bugFrame = new Ext.BoxComponent({
	autoEl : {
		tag : 'iframe',
		frameborder : 0,
		src : '',
		style : 'display:none;',
		id : 'xbug-profile-iframe'
	},
	id : 'xbug-profile-iframe',
	listeners: {
        afterrender: function () {
            this.getEl().on('load', function () {
				xBug.stores.Parser.load();	
            });
        }
    }
})

Ext.onReady(function() {
    xBug.panel.bugFrame.render(Ext.getDom('xbug-panel-profiler-div'));
});
xBug.panel.Profiler = function(config) {
    config = config || {};
    Ext.apply(config, {
		id : 'xbug-profiler',
		baseCls: 'xbug-formpanel',
		cls: 'container',
		title : '<h2>' + _('xbug.profiler') + '</h2>' + '<p>' + _('xbug.profiler.desc') + '</p>',
        frame : false,
        border: false,
		renderTo : 'xbug-panel-profiler-div',
		items : [{
			id : 'xbug-profiler-form',
			xtype : 'form',
			padding : 10,
			border : false,
			frame : true,
			autoWidth : true,
			items : [{
				xtype : 'textfield',
				fieldLabel : 'URL or resource id',
				name : 'resource',
				width : 400,
                id : 'url',
                description : 'Resource ID or URL from site without domain'
			},{
                xtype: 'label'
                ,forId: 'url'
                ,html: 'Resource ID or URL from site without domain'
                ,cls: 'desc-under'

            },{
				xtype : 'textfield',
				fieldLabel : 'URL parameters',
				name : 'url-params',
				width : 400,
                id : 'parameters',
                description : 'Url parameters in format &somevar=1&othervar=2'
			},{
                xtype: 'label'
                ,forId: 'parameters'
                ,html: 'Url parameters in format &somevar=1&othervar=2'
                ,cls: 'desc-under'

            },{
                xtype : 'toolbar',
                items :  [{
                    xtype : 'checkbox',
                    name : 'clear_cache',
                    id : 'clear_cache',
                    boxLabel : 'Refresh cache before page load'
                },{
                    xtype : 'tbspacer',
                    width : '20'
                },{
                    xtype : 'button',
                    name : 'profile',
                    text : 'Profile Page',
                    handler : this.profilePage
                }]
            }]
		},{
			xtype : 'panel',
			autoHeight : true,
			height : 800,
			items : [xBug.grid.Parser.show(),
				xBug.grid.Profile.show()]
		}]
	});
    xBug.panel.Profiler.superclass.constructor.call(this, config);
}


Ext.extend(xBug.panel.Profiler, MODx.Panel, {
    profilePage : function(b, e) {
		if (!xBug.panel.bugFrame.rendered) {
			xBug.panel.bugFrame.render();
		}
        var params = Ext.getCmp('parameters').getValue();
        var url = Ext.getCmp('url').getValue();
        if (url % 1 === 0) { // Quite dummy check
            url = "?id=" + url;
        }
        var clear_cache = Ext.getCmp('clear_cache').getValue() ? 1 : 0;

		xBug.panel.bugFrame.el.dom.src = MODx.config.base_url +url+'&xbug=17b9f8cee523dc27e7ff3978c7e75139&clear_cache='+clear_cache;
    }
});

Ext.reg('xbug-panel-profiler', xBug.panel.Profiler);