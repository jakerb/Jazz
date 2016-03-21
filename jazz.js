var jazz = {

	init:function() {
		var that = this;
		that.loadResources();
	}, 

	prop:function(k,v) {
		var that = this;
		jazz.scope[k] = v;
		that.propCallback(k,v);
		that.loadResources();
	},

	loadResources:function() {
		var that = this;

		$(that.styleLink).each(function() {
			$(this).remove();
		});

		$(that.headLink).each(function() {
			if($(this).attr('rel') == that.linkType) {
				var path = $(this).attr('href');
				jazz.resources.push(path);
				$.get(path, function(e) {
					jazz.modResources($.trim(e));
				});
			}
		});

	},

	modResources:function(e) {
		var that = this;
		var params = {};
		e = e.split(that.splitter);

		for (i = 0; i < e.length; i++) {
			if(e[i].length > 1) {
				var style = $.trim(e[i].replace(/\n|\r/g, '')) + that.splitter;
				var point = style.split(that.openSplitter);
					point_ = point[1].replace(that.splitter, '');
					point_ = point_.split(';');

				params[$.trim(point[0])] = [];

				for (x = 0; x < point_.length; x++) {
					if(point_[x].length > 1) {
						var tmp = point_[x].split(':');
						tmp[1] = $.trim(tmp[1]);

						var $$ = this.scope;

						if(tmp[1].substring(0,3) == this.variable && this.scope[tmp[1].substr(that.variable.length, tmp[1].length)]) {
							tmp[1] = this.scope[tmp[1].substr(that.variable.length, tmp[1].length)];
						}

						if(tmp[1].indexOf('[') != -1 && tmp[1].indexOf(']')) {
							var ev = tmp[1].substr(tmp[1].indexOf('['), tmp[1].indexOf(']')+1);
							var eva = ev.replace('[', '');
								eva = eva.replace(']', '');
							tmp[1] = tmp[1].replace(ev, eval(eva));
						}


						params[$.trim(point[0])][$.trim(tmp[0])] = tmp[1];
					}
				};
			}
		};

		jazz.params = params;
		var css = '';

		$.each(params, function(kv, obj) {
			css += kv + '{';
			for(property in obj) {
				css += property + ':' + obj[property] + ';';
			}
			css += '}';
		});

		$('head style[data-type="jazz"]').remove();
		$('head').append('<style data-type="jazz">'+css+'</style>');

		jazz.isReady = true;

		$.each(that.complete, function(k,v) {
			v();
		});


	},

	onComplete:function(func) {
		var that = this;
		jazz.complete.push(func);
	},

	onResize:function(func) {
		var that = this;
		jazz.ready(function() {
			
			$(window).on('resize', function() {
				setTimeout(function() {
					func();	
				}, 70);
				
			});
		});
	},

	ready:function(func) {
		var that = this;
		var check = setInterval(function() {
			if(jazz.isReady) {
				clearInterval(check);
				func();
			}
		}, 200);
	},

	get:function(sc, k) {
		if(jazz.params[sc][k]) {
			return jazz.params[sc][k];
		}
	}

};

jazz.headLink = 'head link';
jazz.styleLink = 'style[data-type="jazz"]';
jazz.linkType = 'jazz/css';
jazz.splitter = '}';
jazz.openSplitter = '{';
jazz.variable = '$$.';
jazz.resources = [];
jazz.isReady = false;
jazz.params = [];
jazz.complete = [];
jazz.propCallback = function() {};
jazz.scope = {
	winWidth: $(window).width(),
	winHeight: $(window).height()

};
jazz.init();
