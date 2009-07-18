Number.prototype.mod = function(n) {
  return ((this%n)+n)%n;
}

Number.prototype.hash = function() {
  var key = this;
  key += (key << 12);
  key ^= (key >> 22);
  key += (key << 4);
  key ^= (key >> 9);
  key += (key << 10);
  key ^= (key >> 2);
  key += (key << 7);
  key ^= (key >> 12);
  return key;
}

var Permutation = Class.create({
  
  initialize: function(size, rank){
    this.size = size;
    this.rank = rank || 0;
    this.collection = null;
    this.last = this.factorial(size) - 1;
  },
  
  project: function(data){
    var collection_data = data || this.collection;
    if(collection_data == null) return "";
    if(collection_data.length != this.size) return "";
    var projection = new Array(collection_data.length);
    this.value().each(function(i, j){
      projection[j] = collection_data[i];
    });
    if(Object.isString(collection_data)){
      return $A(projection).join("");
    } else {
      return projection;
    }
  },
  
  _each: function(iterator) {
    for(var r = 0; r <= this.last; r++){
      var klon = Object.clone(this);
      klon.setRank(r);
      iterator(klon);
    }
  },
  
  doEach: function(iterator){
    var old_rank = this.rank;
    for(var r = 0; r <= this.last; r++){
      this.setRank(r);
      iterator(this);
    }
    this.setRank(old_rank);
  },
  
  doNext: function(){
    this.setRank(this.rank + 1);
    if(this.rank > this.last) this.setRank(0);
    return this;
  },
  
  next: function(){
    return Object.clone(this).doNext();
  },
  
  succ: function(){
    return this.next();
  },
  
  doPred: function(){
    this.setRank(this.rank - 1);
    if(this.rank < 0) this.setRank(this.last);
    return this;
  },
  
  pred: function(){
    return Object.clone(this).doPred();
  },
  
  setRank: function(m){
    this.rank = m.mod(this.factorial(this.size));
  },
  
  compareTo: function(other){
    if(this.rank < other.rank){ return -1 }
    if(this.rank > other.rank){ return 1 }
    return 0;
  },
  
  factorial: function(n){
    $R(Permutation.fcache.length, n).each(function(i) {
      Permutation.fcache[i] = i * Permutation.fcache[i - 1];
    });
    return Permutation.fcache[n];
  },
  
  hash: function(){
    return this.size.hash() ^ this.rank.hash()
  },
  
  signum: function(){
    var s = 1;
    this.cycles().each(function(c){
      if(c.length.mod(2) == 0){
        s = s * -1;
      }
    });
    return s;
  },
	
	even: function(){
		return this.signum() == 1;
	},
	
	odd: function(){
		return this.signum() == -1;
	},
	
  rank_indices: function(p){
    var result = 0;
    for(var i = result; i < this.size; i++){
			var p_i = p[i] ? p[i].ord() : p[i];
      result = result + (p_i * this.factorial(this.size - i - 1));
      for(var j = (i+1); j < this.size; j++){
				var p_j = p[j] ? p[j].ord() : p[j];
        if(p_j > p_i){
					if(Object.isString(p)){
						p[j] = (p_j - 1).chr();
						var p_a = p.toArray();
						p_a[j] = (p_j - 1).chr();
						p = p_a.join("");
					} else {
						p[j] = (p_j - 1).chr();
					}
				}
				p_j = p[j] ? p[j].ord() : p[j];
      }
    }
    return result;    
  },
  
  unrank_indices: function(m){
    var result = [];
    this.size.times(function(index){
      result[index] = 0;
    });
    for(var i = 0; i < this.size; i++){
      var f = this.factorial(i);
      var x = m.mod((f * (i+1)));
      m = m - x;
      x = x / f;
      result[this.size - i - 1] = x;
      x = x - 1;
      for(var j = this.size - i; j < this.size; j++){
        if(result[j] > x) result[j] = result[j] + 1;
      }
    }
    return result;
  },
  
  value: function(){
    return this.unrank_indices(this.rank);
  },
  
  doInvert: function(){
    var indices = this.unrank_indices(this.rank);
    var inverted = new Array(this.size);
    for(var i = 0; i <= this.size; i++){
      inverted[indices[i]] = i;
    }
    this.setRank(this.rank_indices(inverted));
    return this;
  },
  
  compose: function(other){
    if(this.size != other.size) throw "permutations of unequal sizes cannot be composed!";
    var indices = this.value();
    var composed = other.value().map(function(i){ return indices[i]; });
    var klon = Object.clone(this);
    klon.setRank(this.rank_indices(composed));
    return klon;
  },
  
  toArray: function(){
    var ary = [];
    this.each(function(o){ ary.push(o)});
    return ary;
  },
  
  eql: function(other){
    return this.size == other.size && this.rank == other.rank;
  },
  
  invert: function(){
    return Object.clone(this).doInvert();
  },
  
  doRandom: function(){
    var new_rank = Math.floor(Math.random()*(this.last + 1));
    this.setRank(new_rank);
    return this;
  },
  
  random: function(){
    return Object.clone(this).doRandom();
  },
  
  cycles: function(){
    var perm = this.value();
    var result = [[]];
    var seen = new Hash();
    var current = null;
    while(true){
			if(current == null || Object.isUndefined(current)){
				current = perm.find(function(x){return Object.isUndefined(seen.get(x))});
			}
      if(current == null || Object.isUndefined(current)){ break };
      if(!Object.isUndefined(seen.get(current))){
        current = null
        result.push([]);
      } else {
				seen.set(current, true);
        result.last().push(current);
        current = perm[current];
      }
    }
    result.pop();
		return result.select(function(c){ return c.length > 1}).map(function(c){
      var min_index = c.indexOf(c.min());
      return c.slice(min_index, c.length).concat(c.slice(0, min_index));
    });
  }

});

Object.extend(Permutation.prototype, Enumerable);
Object.extend(Permutation.prototype, Comparable);

Permutation.fcache = [ 1 ];

Permutation.from_value = function(indices){
  obj = new Permutation(indices.length);
  obj.setRank(obj.rank_indices(indices));
  return obj;
}

Permutation.for_value = function(collection, rank){
  var rank = rank || 0;
  var perm = new Permutation(collection.length, rank);
  perm.collection = collection;
  return perm;
}

Permutation.from_cycles = function(cycles, max){
  var max = max || 0;
	var indices = new Array(max);
	cycles.each(function(cycle){
		if(cycle.length == 0) { return true; }
		for(var i = 0; i < cycle.length; i++){
			indices[cycle[i - 1]] = cycle[i]
		}
	});
	indices.each(function(r, i){
		if(Object.isUndefined(r) || r == false || r == null){
			indices[i] = i;
		}
	});
	return Permutation.from_value(indices);
}