var Comparable = {
    lt: function(object) {
        return this.compareTo(object) == -1;
    },
    lte: function(object) {
        return this.compareTo(object) < 1;
    },
    gt: function(object) {
        return this.compareTo(object) == 1;
    },
    gte: function(object) {
        return this.compareTo(object) > -1;
    },
    eq: function(object) {
        return this.compareTo(object) == 0;
    }
};

Array.prototype.compare = function(testArr) {
    if (this.length != testArr.length) return false;
    for (var i = 0; i < testArr.length; i++) {
        if (this[i].compare) { 
            if (!this[i].compare(testArr[i])) return false;
        }
        if (this[i] !== testArr[i]) return false;
    }
    return true;
}