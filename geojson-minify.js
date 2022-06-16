
(function(root){
	// Part of the Open Innovations namespace
	var OI = root.OI || {};
	if(!OI.ready){
		OI.ready = function(fn){
			// Version 1.1
			if(document.readyState != 'loading') fn();
			else document.addEventListener('DOMContentLoaded', fn);
		};
	}
	var loader = '<svg version="1.1" width="64" height="64" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(.11601 0 0 .11601 -49.537 -39.959)"><path d="m610.92 896.12m183.9-106.17-183.9-106.17-183.9 106.17v212.35l183.9 106.17 183.9-106.17z" fill="black"><animate attributeName="opacity" values="1;0;0" keyTimes="0;0.7;1" dur="1s" begin="-0.83333s" repeatCount="indefinite" /></path><path d="m794.82 577.6m183.9-106.17-183.9-106.17-183.9 106.17v212.35l183.9 106.17 183.9-106.17z" fill="black"><animate attributeName="opacity" values="1;0;0" keyTimes="0;0.7;1" dur="1s" begin="-0.6666s" repeatCount="indefinite" /></path><path d="m1162.6 577.6m183.9-106.17-183.9-106.17-183.9 106.17v212.35l183.9 106.17 183.9-106.17z" fill="black"><animate attributeName="opacity" values="1;0;0" keyTimes="0;0.7;1" dur="1s" begin="-0.5s" repeatCount="indefinite" /></path><path d="m1346.5 896.12m183.9-106.17-183.9-106.17-183.9 106.17v212.35l183.9 106.17 183.9-106.17z" fill="black"><animate attributeName="opacity" values="1;0;0" keyTimes="0;0.7;1" dur="1s" begin="-0.3333s" repeatCount="indefinite" /></path><path d="m1162.6 1214.6m183.9-106.17-183.9-106.17-183.9 106.17v212.35l183.9 106.17 183.9-106.17z" fill="black"><animate attributeName="opacity" values="1;0;0" keyTimes="0;0.7;1" dur="1s" begin="-0.1666s" repeatCount="indefinite" /></path><path d="m794.82 1214.6m183.9-106.17-183.9-106.17-183.9 106.17v212.35l183.9 106.17 183.9-106.17z" fill="black"><animate attributeName="opacity" values="1;0;0" keyTimes="0;0.7;1" dur="1s" begin="0s" repeatCount="indefinite" /></path></g></svg>';

	function Minify(){
		
		var _obj = this;
		// When the user focuses on the schema output, it all gets selected
		document.querySelector('#geojson').addEventListener('focus',function(e){
			console.log('focus',e);
			e.target.select()
		});
		
		document.getElementById('save').addEventListener('click',function(){ _obj.save() });


		// Setup the dnd listeners.
		var dropZone = document.getElementById('drop_zone');
		dropZone.addEventListener('dragover', dropOver, false);
		dropZone.addEventListener('dragout', dragOff, false);

		var _obj = this;
		document.getElementById('standard_files').addEventListener('change',function(evt){
			evt.stopPropagation();
			evt.preventDefault();
			_obj.reset();
			return _obj.handleFileSelect(evt,'geojson');
		}, false);

	}
	Minify.prototype.reset = function(){
		document.getElementById('drop_zone').classList.remove('loaded');
		delete this.geojson;
		delete this.filesize;
		delete this.file;
		delete this.output;
		document.getElementById('filedetails').innerHTML = "";
	}
	Minify.prototype.handleFileSelect = function(evt,typ){

		document.getElementById('filesize').innerHTML = loader;

		dragOff(evt);

		var files;
		if(evt.dataTransfer && evt.dataTransfer.files) files = evt.dataTransfer.files; // FileList object.
		if(!files && evt.target && evt.target.files) files = evt.target.files;

		if(typ == "geojson"){

			// files is a FileList of File objects. List some properties.
			var output = "";
			f = files[0];

			this.file = f.name;
			this.filesize = f.size;
			// ('+ (f.type || 'n/a')+ ')
			output += '<strong>'+ (f.name)+ '</strong> - ' + niceSize(f.size) + ', last modified: ' + (f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a');

			var start = 0;
			var stop = f.size - 1; //Math.min(100000, f.size - 1);

			var reader = new FileReader();

			var _obj = this;
			this.output = '';
			// Closure to capture the file information.
			reader.onloadend = function(evt) {
				if (evt.target.readyState == FileReader.DONE) { // DONE == 2
					if(stop > f.size - 1){
						var l = evt.target.result.regexLastIndexOf(/[\n\r]/);
						result = (l > 0) ? evt.target.result.slice(0,l) : evt.target.result;
					}else result = evt.target.result;

					var lines = result.match(/[\n\r]+/g);
					var cols = result.slice(0,result.indexOf("\n")).split(/,(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))/);
					// Render table
					_obj.processGeoJSON(result);
				}
			};
			
			// Read in the image file as a data URL.
			var blob = f.slice(start,stop+1);
			reader.readAsText(blob);

			document.getElementById('filedetails').innerHTML = output;
			document.getElementById('drop_zone').classList.add('loaded');
		}
		return this;
	};
	Minify.prototype.processGeoJSON = function(result){
		var json = JSON.parse(result);
		var output = JSON.stringify(json);
		var str,strstart,strend;
		output.replace(/^(.*,"features":\[).*(\]\})$/,function(m,p1,p2){ strstart = p1; strend = p2; return p1; });
		str = '';

		for(var i = 0; i < json.features.length; i++){
			
			str += (str ? ",\n":"")+JSON.stringify(json.features[i]);
		}
		output = strstart+'\n'+str+'\n'+strend;
		document.getElementById('geojson').innerHTML = output;
		document.getElementById('filesize').innerHTML = 'Original file: '+niceSize(this.filesize)+'. Minified: '+niceSize(output.length)+'. Savings: '+niceSize(this.filesize-output.length)+' - <span class="pc">'+(100*(this.filesize-output.length)/this.filesize).toFixed(1)+'%</span> smaller.';
		this.output = output;
		console.log('done',this.output);
		return this;
	};
	Minify.prototype.save = function(){

		if(!this.output) return this;

		// Bail out if there is no Blob function
		if(typeof Blob!=="function") return this;

		var textFileAsBlob = new Blob([JSON.stringify(this.geojson)], {type:'text/plain'});
		if(!this.file) this.file = "schema.json";
		var fileNameToSaveAs = this.file.substring(0,this.file.lastIndexOf("."))+".geojson";

		function destroyClickedElement(event){ document.body.removeChild(event.target); }

		var dl = document.createElement("a");
		dl.download = fileNameToSaveAs;
		dl.innerHTML = "Download File";
		if(window.webkitURL != null){
			// Chrome allows the link to be clicked
			// without actually adding it to the DOM.
			dl.href = window.webkitURL.createObjectURL(textFileAsBlob);
		}else{
			// Firefox requires the link to be added to the DOM
			// before it can be clicked.
			dl.href = window.URL.createObjectURL(textFileAsBlob);
			dl.onclick = destroyClickedElement;
			dl.style.display = "none";
			document.body.appendChild(dl);
		}
		dl.click();

		return this;
	}
	// Function to clone a hash otherwise we end up using the same one
	function clone(hash) {
		var json = JSON.stringify(hash);
		var object = JSON.parse(json);
		return object;
	}

	function dropOver(evt){
		evt.stopPropagation();
		evt.preventDefault();
		evt.target.classList.add('drop');
		evt.target.classList.remove('loaded');
	}
	function dragOff(evt){
		evt.target.classList.remove('drop');
	}

	function niceSize(b){
		if(b > 1e12) return (b/1e12).toFixed(2)+" TB";
		if(b > 1e9) return (b/1e9).toFixed(2)+" GB";
		if(b > 1e6) return (b/1e6).toFixed(2)+" MB";
		if(b > 1e3) return (b/1e3).toFixed(2)+" kB";
		return (b)+" bytes";
	}

	OI.ready(function(){
		OI.minify = new Minify();
	});

	root.OI = OI;
})(window || this);