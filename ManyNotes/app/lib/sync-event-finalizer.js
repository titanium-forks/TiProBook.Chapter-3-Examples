
var agent = {
	createEventRequest : function(event){
		if(event !=undefined || event !=null){
			return JSON.stringify(event);
		}else{
			return null;
		}
	},		
	broadcast : function(evtStore){
		var promises = [];
		
		evtStore.setSortField("modifyID", "ASC");
		evtStore.sort();		
		
		_.each(evtStore.models, function(evt) {			
			var deferred = Q.defer();			
		    var request = agent.createEventRequest(evt);
		    if(request!==null){
				Alloy.Globals.azure.InsertTable('noteEvents', request, function(data) {
					deferred.resolve(data);				
	            }, function(err) {
	                var error = JSON.parse(JSON.stringify(errorMessage));
	   				defer.reject({
						success:  false,
						message: error
					});
	            });	    	
		    }

            promises.push(deferred.promise);                	
		});	
		
		return Q.all(promises);	
	},
	finalize : function(evtStore){
		evtStore.setSortField("modifyID", "DESC");
		evtStore.sort();	
		if(evtStore.models.length === 0 ){
			return new Date().getTime();
		}else{
			return evtStore.models[0].modifyID;
		}	
	}	
};

var publisher = function(evtStore){
	var defer = Q.defer();
	agent.broadcast(evtStore)
		.then(function(){
			defer.resolve(agent.finalize(evtStore));
		});
	return defer.promise;	
};