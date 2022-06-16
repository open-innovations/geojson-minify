/* Open Innovations GeoJSON Minifier v0.1 */
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
		document.querySelector('#geojson').addEventListener('focus',function(e){ e.target.select(); });
		
		document.getElementById('save').addEventListener('click',function(){ _obj.save(); });

		// Setup the dnd listeners.
		var dropZone = document.getElementById('drop_zone');
		dropZone.addEventListener('dragover', dropOver, false);
		dropZone.addEventListener('dragout', dragOff, false);

		document.getElementById('standard_files').addEventListener('change',function(evt){
			evt.stopPropagation();
			evt.preventDefault();
			_obj.reset();
			return _obj.handleFileSelect(evt,'geojson');
		}, false);

		function updatePrecision(){
			var circ = 40075017;
			var dp = document.getElementById('precision').value;
			var prec = (circ/360)/Math.pow(10,dp);
			document.querySelector('.precision-metres').innerHTML = niceSizeMetres(prec);
			if(_obj.filecontent){
				document.getElementById('loader').innerHTML = loader;
				document.querySelector('#geojson').innerHTML = "";
				setTimeout(function(){
					_obj.trimGeoJSON(_obj.filecontent);
				},200);
			}
		}

		updatePrecision();
		document.getElementById('precision').addEventListener('change',updatePrecision);

	}
	Minify.prototype.reset = function(){
		document.getElementById('drop_zone').classList.remove('loaded');
		delete this.geojson;
		delete this.filecontent;
		delete this.filesize;
		delete this.file;
		delete this.output;
		delete this.input;
		delete this.json;
		delete this.properties;
		
		document.getElementById('properties').innerHTML = "";
		document.getElementById('filedetails').innerHTML = "";
	};
	Minify.prototype.handleFileSelect = function(evt,typ){

		document.getElementById('loader').innerHTML = loader;

		dragOff(evt);

		var files,f,output,start,stop,_obj;
		if(evt.dataTransfer && evt.dataTransfer.files) files = evt.dataTransfer.files; // FileList object.
		if(!files && evt.target && evt.target.files) files = evt.target.files;

		if(typ == "geojson"){

			// files is a FileList of File objects. List some properties.
			output = "";
			f = files[0];

			this.file = f.name;
			this.filesize = f.size;
			// ('+ (f.type || 'n/a')+ ')
			output += '<strong>'+ (f.name)+ '</strong> - ' + niceSize(f.size) + ', last modified: ' + (f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a');

			start = 0;
			stop = f.size - 1; //Math.min(100000, f.size - 1);

			var reader = new FileReader();

			_obj = this;
			this.output = '';
			// Closure to capture the file information.
			reader.onloadend = function(evt) {
				var result;
				if (evt.target.readyState == FileReader.DONE) { // DONE == 2
					if(stop > f.size - 1){
						var l = evt.target.result.regexLastIndexOf(/[\n\r]/);
						result = (l > 0) ? evt.target.result.slice(0,l) : evt.target.result;
					}else result = evt.target.result;

					_obj.loadedGeoJSON(result);
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
	Minify.prototype.loadedGeoJSON = function(result){
		var f,p,_obj;
		this.filecontent = result;
		this.json = JSON.parse(result);
		this.properties = {};
		for(f = 0; f < this.json.features.length; f++){
			if(this.json.features[f].properties){
				for(p in this.json.features[f].properties){
          if(this.json.features[f].properties[p]){
            if(!this.properties[p]) this.properties[p] = {'n':0,'b':0,'active':true};
            this.properties[p].n++;
            this.properties[p].b += (',"'+p+'":'+JSON.stringify(this.json.features[f].properties[p])).length;
          }
				}
			}
		}
		_obj = this;
		function makeLI(p,b){
			var id,li,lbl,btn,inp;
			id = 'prop-'+p.replace(/ /g,'');
			li = document.createElement('li');
			li.classList.add('seasonal');
			li.setAttribute('title',p);
			lbl = document.createElement('label');
			lbl.setAttribute('for',id);
			lbl.innerHTML = '<b>'+p+'</b> ('+niceSize(b)+')';
			btn = document.createElement('button');
			btn.classList.add('close');
			btn.innerHTML = '<span aria-hidden="true">×</span>';
			inp = document.createElement('input');
			inp.setAttribute('type','checkbox');
			inp.setAttribute('checked','checked');
			inp.setAttribute(id,id);
			li.appendChild(lbl);
			li.appendChild(btn);
			btn.appendChild(inp);
			inp.addEventListener('change',function(e){
				_obj.toggleProperty(p);
			});
			return {'li':li,'inp':inp,'btn':btn,'p':p};
		}
    var ul,props,sorted,h3;

    ul = document.createElement('ul');
		ul.classList.add('toggles');
		props = this.properties;
		sorted = Object.keys(this.properties).sort(function(a,b){return props[a].b-props[b].b;}).reverse();
		for(f = 0; f < sorted.length; f++){
			p = sorted[f];
			this.properties[p].toggle = new makeLI(p,this.properties[p].b);
			ul.appendChild(this.properties[p].toggle.li);
		}
		if(sorted.length > 0){
			h3 = document.createElement('h3');
			h3.innerHTML = 'Properties';
			document.getElementById('properties').appendChild(h3);
			document.getElementById('properties').appendChild(ul);
		}
		return this.trimGeoJSON();
	};
	Minify.prototype.trimGeoJSON = function(){
		var str,strstart,strend,f,p,prec,json,output;
		// Get a copy of the JSON so we can manipulate it
		json = clone(this.json);

		// Remove any deselected properties
		for(f = 0; f < json.features.length; f++){
			if(json.features[f].properties){
				for(p in this.properties){
					if(this.properties[p] && !this.properties[p].active){
						delete json.features[f].properties[p];
					}
				}
			}
		}

		// Convert it to a string
		output = JSON.stringify(json);
		// Find the part before "features" and after it
		output.replace(/^(.*,"features":\[).*(\]\})$/,function(m,p1,p2){ strstart = p1; strend = p2; return p1; });
		str = '';

		// Get the precision to use
		prec = document.getElementById('precision').value;
		var re = RegExp('(\-?[0-9]+\.[0-9]+)','g');

		// Loop over the features and stringify each separately (this lets us put newlines between them)
		for(f = 0; f < json.features.length; f++){
			tstr = JSON.stringify(json.features[f]);
			// Limit coordinate precision to the coordinates variable
			tstr = tstr.replace(/("coordinates" ?:)([^\"\}]*)/g,function(m,p1,p2){
				var rtn = p1;
				if(prec > 0){
					p2 = p2.replace(re,function(m,p3){
						if(p3.indexOf('.')<0) return p3;
						else return (parseFloat(p3)).toFixed(prec);
					});
					// Remove trailing zeros that don't add anything useful
					p2 = p2.replace(/([0-9]\.[0-9]+?)0+(\s*[\,\]])/g,function(m,p3,p4){ return p3+p4; });
				}else{
					p2 = p2.replace(/([,\[] ?\-?[0-9])\.[0-9]+/g,function(m,p3){ return p3; });
				}
				return rtn + p2;
			});
			str += (str ? ",\n":"")+tstr;
		}

		// Build the output
		output = strstart+'\n'+str+'\n'+strend;
		document.getElementById('geojson').innerHTML = output;
		// Save the output
		this.output = output;

		// Update the stats
		document.getElementById('filesize').innerHTML = 'Original file: '+niceSize(this.filesize)+'. Minified: '+niceSize(output.length)+'. Savings: '+niceSize(this.filesize-output.length)+' - <span class="pc">'+(100*(this.filesize-output.length)/this.filesize).toFixed(1)+'%</span> smaller.';

		document.getElementById('loader').innerHTML = '';
		return this;
	};
	Minify.prototype.toggleProperty = function(p){
		this.properties[p].active = !this.properties[p].active;
		var oncls = 'b5-bg';
		var on = this.properties[p].toggle.inp.checked;
		if(on){
			this.properties[p].toggle.li.classList.remove(oncls.split(/ /));
			this.properties[p].toggle.li.classList.add('seasonal');
		}else{
			this.properties[p].toggle.li.classList.remove('seasonal');
			this.properties[p].toggle.li.classList.add(oncls.split(/ /));
		}
		return this.trimGeoJSON();
	};
	Minify.prototype.save = function(){

		if(!this.output) return this;

		// Bail out if there is no Blob function
		if(typeof Blob!=="function") return this;

		var textFileAsBlob = new Blob([this.output], {type:'text/plain'});
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
	};
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
	function niceSizeMetres(b){
		if(b > 1e3) return (b/1e3).toFixed(2)+" km";
		if(b > 100) return Math.round(b)+" m";
		if(b > 10) return (b).toFixed(1)+" m";
		if(b > 1) return (b).toFixed(2)+" m";
		if(b > 1e-2) return (b/1e-2).toFixed(1)+" cm";
		if(b > 1e-3) return (b/1e-3).toFixed(1)+" mm (a pinhead is about 1mm)";
		if(b > 1e-6) return (b/1e-6).toFixed(1)+" &micro;m) (a piece of paper is about 90 &micro;m thick)";
		if(b > 1e-9) return (b/1e-9).toFixed(1)+" nm (a bacterial flagellum is about 20 nm)";
		if(b > 1e-12) return (b/1e-12).toFixed(1)+" pm (a hydrogen atom is about 25 pm)";
		if(b > 1e-15) return (b/1e-15).toFixed(1)+" fm";
		if(b > 1e-18) return (b/1e-18).toFixed(1)+" am";
		if(b > 1e-21) return (b/1e-21).toFixed(1)+" zm";
		return (b)+" m";
	}

	OI.ready(function(){
		OI.minify = new Minify();
	});

	root.OI = OI;
})(window || this);