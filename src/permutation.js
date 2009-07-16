var Permutation = Class.create({
  
  initialize: function(size, rank){
    this.size = size;
    this.rank = rank || 0;
    this.collection = [];
    this.last = this.factorial(size) - 1;
  },
  
  _each: function(iterator) {
    console.log("in _each");
    $R(0, this.last).each(function(r){
      var klon = Object.clone(this);
      klon.setRank(r);
      iterator(klon);
    });
  },
  
  setRank: function(m){
    this.rank = m % this.factorial(this.size);
  },
  
  factorial: function(n){
    $R(Permutation.fcache.length, n).each(function(i) {
      Permutation.fcache[i] = i * Permutation.fcache[i - 1];
    });
    return Permutation.fcache[n];
  },
  
  signum: function(){
    var s = 1;
    cycles.each(function(c){
      if(c.length % 2 == 0){
        s = s * -1;
      }
    });
    return s;
  },
  
  rank_indices: function(p){
    var result = 0; 
    for(var i = result; i <= this.size; i++){
      result += p[i] * this.factorial(this.size - i - 1);
      for(var j = (i+1); j <= this.size; j++){
        if(p[j] > p[i]) p[j] -= 1; 
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
      var x = m % (f * (i+1));
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
    $R(0, this.size).each(function(i){
      inverted[indices[i]] = i;
    });
    this.setRank(this.rank_indices(inverted));
    return this;
  },
  
  compose: function(other){
    if(this.size != other.size) throw "permutations of unequal sizes cannot be composed!";
    var indices = this.value();
    var composed = other.value.map(function(i){ return indices[i]; });
    var klon = Object.clone(this);
    klon.setRank(this.rank_indices(composed));
    return klon;
  },
  
  invert: function(){
    return Object.clone(this).doInvert();
  },
  
  cycles: function(){
    var perm = this.value();
    var result = [[]];
    var seen = {};
    var current = null;
    while(seen != perm.length){
      current = current || perm.find(function(x){return !seen[x]});
      if(current == null){ break };
      if(seen[current]){
        current = nil
        result.push([]);
      } else {
        seen[current] = true;
        result.last().push(current);
        current = perm[current];
      }
      result.pop();
      return result.select(function(c){ return c.length > 1}).map(function(c){
        var min_index = c.indexOf(c.min());
        return c.slice(min_index, c.length).concat(c.slice(0, min_index));
      });
    }
  }

});

Object.extend(Permutation.prototype, Enumerable);


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