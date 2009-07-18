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

Number.prototype.ord = function(){
	return this;
}

Number.prototype.chr = function(){
	var codePt = this;
	if (codePt > 0xFFFF) { // Create a four-byte string (length 2) since this code point is high
                                           //   enough for the UTF-16 encoding (JavaScript internal use), to
                                           //   require representation with two surrogates (reserved non-characters
                                           //   used for building other characters; the first is "high" and the next "low")
      codePt -= 0x10000;
      return String.fromCharCode(0xD800 + (codePt >> 10), 0xDC00 + (codePt & 0x3FF));
  }
  else {
      return String.fromCharCode(codePt);
  }
}

String.prototype.ord = function(){
	var str = this;
	var code = str.charCodeAt(0);
    if (0xD800 <= code && code <= 0xDBFF) { // High surrogate (could change last hex to 0xDB7F to treat high private surrogates as single characters)
        var hi = code;
        if (str.length === 1) {
            return code; // This is just a high surrogate with no following low surrogate, so we return its value;
                                    // we could also throw an error as it is not a complete character, but someone may want to know
        }
        var low = str.charCodeAt(1);
        if (!low) {
            
        }
        return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
    }
    if (0xDC00 <= code && code <= 0xDFFF) { // Low surrogate
        return code; // This is just a low surrogate with no preceding high surrogate, so we return its value;
                                // we could also throw an error as it is not a complete character, but someone may want to know
    }
    return code;
}

String.prototype.allToBinary = function(){
	return this.split("").map(function(c){return c.toBinary()}).join("");
}

String.prototype.binaryDistanceTo = function(other){
	var distance = 0;
	for(var i = 0, length = this.length; i<length; i++){
		if(this.charAt(i) != other.charAt(i)) distance += 1;
	}
	return distance;
}

String.prototype.distanceTo = function(other){
	var binary1 = SHA1(this).allToBinary()
	var binary2 = SHA1(other).allToBinary()
	return binary1.binaryDistanceTo(binary2);
}


String.prototype.toBinary = function(){
	var len=this.length;
	var tot=0;
	var i,j,ch;
	var result = "";
	for(i=0,j=len-1;i<len;i++,j--)
	{	
		ch=this.charAt(i);
		if(ch=="a" || ch=="A")
		{	
			tot=tot+10;
		}
		else if(ch=="b" || ch=="B")
		{
			tot=tot+11;
		}
		else if(ch=="c" || ch=="C")
		{
			tot=tot+12;
		}
		else if(ch=="d" || ch=="D")
		{
			tot=tot+13;
		}
		else if(ch=="e" || ch=="E")
		{
			tot=tot+14;
		}
		else if(ch=="f" || ch=="F")
		{
			tot=tot+15;
		}
		else
		{
			tot=tot+parseInt(this.charAt(i))*Math.pow(16,j);
		}
	}
	var dec=new Number(tot);
	var almost = "0000"+dec.toString(2);
	return almost.substr(almost.length - 4);
}