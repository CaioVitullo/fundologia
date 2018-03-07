Array.prototype.where = function (property, value) {
    var a = [];
    for (var i = 0; i < this.length; i++) {
        var item = this[i];
        if (item[property] == value)
            a.push(item);
    }

    return a;
};
Array.prototype.first = function (obj) {
    if (obj == null && this.length > 0) {
        return this[0];
    } else if (typeof (obj) == 'string') {
        return this[0][obj];
    }


    for (var i = 0; i < this.length; i++) {
        var item = this[i];
        var b = true;
        for (k in obj) {
            b = b && item[k] == obj[k]
        }
        if (b)
            return item;
    }

    return null;
};
Array.prototype.firstOrFirst = function (obj) {
    var item = this.first(obj);
    if (item != null)
        return item;

    if (item == null && this.length > 0) {
        return this[0];
    } else {
        return null;
    }
}
Array.prototype.last = function (obj) {
    if (obj == null && this.length > 0) {
        return this[this.length - 1];
    } else if (typeof (obj) == 'string') {
        return this[this.length - 1][obj];
    }


    for (var i = this.length - 1; i >= 0; i--) {
        var item = this[i];
        var b = true;
        for (k in obj) {
            b = b && item[k] == obj[k]
        }
        if (b)
            return item;
    }

    return null;
};
Array.prototype.any = function (obj) {
    var a = false;
    this.generalIf(obj, function (item) { a = true; });
    return a;
};
Array.prototype.equals = function (obj) {
    var a = [];
    this.generalIf(obj, function (item) { a.push(item); });
    return a;
};
Array.prototype.generalIf = function (obj, fn, result) {
    result = result == null ? true : false;
    if (typeof (obj) == 'function') {
        for (var i = 0; i < this.length; i++) {
            var aaa=obj(this[i]);
            if (aaa)
                fn(aaa);
        }
    }else if (typeof (obj) == 'number' || typeof (obj) == 'string') {
        for (var i = 0; i < this.length; i++) {
            fn(this[i]);
        }
    } else {
        for (var i = 0; i < this.length; i++) {
            var item = this[i];
            if (typeof (item) != 'function') {
                var b = true;
                for (k in obj) {
                    if (typeof (obj[k]) == 'object' && obj[k].hasOwnProperty('_fntype')) {
                        if (obj[k]._fntype == 'OR') {
                            var c = false;
                            for (e in obj[k].values) {
                                var _item = obj[k].values[e];
                                if (typeof (_item) != 'function')
                                    c = c || item[k] == _item;
                            }
                            b = b && c;
                        } else if (obj[k]._fntype == 'BiggerThan') {
                            b = b && item[k] > obj[k].values;
                        } else if (obj[k]._fntype == 'BiggerOrEqualThan') {
                            b = b && item[k] >= obj[k].values;
                        } else if (obj[k]._fntype == "IsNull") {
                            b = b && item[k] == null;
                        }
                    } else {
                        if (k.indexOf('.') > 0) {
                            var kk = k.split('.');
                            for (var kki = 0; kki < kk.length; kki++) {
                                item = item[kk[kki]];
                            }
                            b = b && item == obj[k]
                        } else {
                            b = b && item[k] == obj[k]
                        }

                    }

                }
                if (b == result)
                    fn(item);
            }
        }
    }

}
Array.prototype.textContains = function (where, what) {
    for (var i = 0; i < this.length; i++) {
        var item = this[i];
        if (typeof (item) == 'object') {
            var b = true;
            for (k in where) {
                var wupper = where[k].toUpperCase();
                b = b && (item[k].toString().indexOf(where[k]) >= 0 || item[k].toString().toUpperCase().indexOf(wupper) >= 0);
            }
            if (b) {
                if (typeof (what) == 'function') {
                    what(item);
                } else if (typeof (what) == 'object') {
                    for (n in what) {
                        item[n] = what[n];
                    }
                }
            }
        }
    }
    return this;
}
Array.prototype.hasText = function (obj) {
    var a = [];
    for (var i = 0; i < this.length; i++) {
        var item = this[i];
        for (var k in obj) {
            var y = true;
            if (item.hasOwnProperty(k) && item[k] != null) {
                y = y && item[k].toUpperCase().indexOf(obj[k].toUpperCase()) >= 0;
            }
        }
        if (y)
            a.push(item);
    }
    return a;
};
Array.prototype.hasTextNA = function (obj) {
    var a = [];
    for (var i = 0; i < this.length; i++) {
        var item = this[i];
        for (var k in obj) {
            var y = true;
            if (item.hasOwnProperty(k) && item[k] != null) {
                y = y && item[k].toUpperCase().indexOf(obj[k].toUpperCase()) >= 0;
            }
        }
        if (y)
            a.push(item);
    }
    return a;
};
Array.prototype.notEquals = function (obj) {
    
    var a = [];
    for (var i = 0; i < this.length; i++) {
        var item = this[i];
        var b = true;
        for (k in obj) {
            b = b && item[k] != obj[k]
        }
        if (b)
            a.push(item);
    }
    return a;
}
Array.prototype.select = function (obj) {
    if (obj == undefined || obj == null || obj.length == 0)
        return [];

    var a = [];
    for (var i = 0; i < this.length; i++) {
        var item = this[i];
        var n = {};
        if (Array.isArray(obj)) {
            for (var j = 0; j < obj.length; j++) {
                if (item.hasOwnProperty(obj[j]))
                    n[obj[j]] = item[obj[j]];
            }
            a.push(n);
        } else if (typeof (obj) == 'string') {
            if (item.hasOwnProperty(obj)) {
                a.push(item[obj]);
            }

        } else {
            for (k in obj) {
                if (typeof (obj[k]) == 'function') {
                    n[k] = obj[k](item);
                } else if (typeof (obj[k]) == 'number') {
                    n[k] = obj[k];
                }
                else {
                    n[k] = item[obj[k]];
                }
            }
            a.push(n);
        }
    }

    return a;
}
Array.prototype.selectToArray = function (obj) {
    var a = [];
    for (var i = 0; i < this.length; i++) {
        var item = this[i];
        if (item.hasOwnProperty(obj)) {
            a.push(item[obj]);
        }
    }

    return a;
}
Array.prototype.count = function (obj) {
    if (obj == undefined || obj == null)
        return this.length;

    var a = 0;
    this.generalIf(obj, function (item) { a++; });
    return a;
}
Array.prototype.allSetTo = function(obj){
    if (obj == undefined || obj == null)
        return false;
    return this.count(obj) == this.length;
}
Array.prototype.remove = function (obj) {
    if (typeof (obj) == 'object') {
        while (this.any(obj)) {
            for (var i = 0; i < this.length; i++) {
                var item = this[i];
                var b = true;

                for (k in obj) {
                    b = b && item[k] == obj[k]
                }


                if (b)
                    this.splice(i, 1);

            }
        }
    } else {
        var i = this.indexOf(obj);
        if (i >= 0) {
            this.splice(i, 1);
        }
    }

    return this;
}
Array.prototype.removeMany = function (list, index) {
    if (list == null)
        return;
    if (index == null) {
        index = 0;
    }
    if (list.count == 0 || list.length < index)
        return;        

    this.remove(list[index]);
    index++;
    return this.removeMany(list, index);

    
}
Array.prototype.set = function (fn) {
    if (typeof (fn) == 'function') {
        for (var i = 0; i < this.length; i++) {
            var item = this[i];
            fn(item);
        }
    } else if (typeof (fn) == 'object') {
        for (var i = 0; i < this.length; i++) {
            var item = this[i]
            for (o in fn) {
                item[o] = fn[o];
            }
        }
    }
}
Array.prototype.setTo = function (where, what) {
    this.generalIf(where, function (item) {
        if (typeof (what) == 'function') {
            what(item);
        } else if (typeof (what) == 'object') {
            for (n in what) {
                item[n] = what[n];
            }
        }
    });

    return this;
}
Array.prototype.max = function (prop) {
    if (this.length == 0)
        return null;

    var m = null;
    if(prop == undefined){
        for (var i = 0; i < this.length; i++) {
            var item = this[i];
            if (m == null || item > m)
                m = item;
        }
    }else{
        for (var i = 0; i < this.length; i++) {
            var item = this[i];
            if (m == null || item[prop] > m)
                m = item[prop];
        }
    }
    
    return m;
}
Array.prototype.min = function (prop) {
    if (this.length == 0)
        return null;

    var m = null;
    if(prop == undefined){
        for (var i = 0; i < this.length; i++) {
            var item = this[i];
            if (m == null || item < m)
                m = item;
        }
    }else{
        for (var i = 0; i < this.length; i++) {
            var item = this[i];
            if (m == null || item[prop] < m)
                m = item[prop];
        }
    }
    
    return m;
}
Array.prototype.objWithMin = function (prop) {
    var min = this.min(prop);
    var t = {};
    t[prop] = min;
    return this.first(t);
};
Array.prototype.objWithMax = function (prop) {
    var max = this.max(prop);
    var k = {};
    k[prop] = max;
    return this.first(k);
};
Array.prototype.take = function (itemsTobeTaken) {
    var n = Math.min(itemsTobeTaken, this.length);
    var m=[];
    for(var i=0;i<n;i++){
        m[i]=this[i];
    }
    return m;
}
Array.prototype.skip = function (length) {
    var a = [];
    for (var i = length; i < this.length; i++) {
        a.push(this[i]);
    }
    return a;
}
Array.prototype.countDistinct = function (prop) {
    var k = {};
    var count = 0;
    for (var i = 0; i < this.length; i++) {
        var item = this[i];
        if (item && !k.hasOwnProperty(item[prop])) {
            k[item[prop]] = 1;
            count++;
        }
    }
    return count;
};
Array.prototype.distinct = function (prop) {
    if (this.length == 0)
        return this;

    var k = {};
    var a = [];
    if (prop == null) {
        for (var i = 0; i < this.length; i++) {
            var item = this[i];
            if (item && !k.hasOwnProperty(item)) {
                k[item] = 1;
                a.push(item);
            }
        }
    } else {
        for (var i = 0; i < this.length; i++) {
            var item = this[i];
            if (item && !k.hasOwnProperty(item[prop])) {
                k[item[prop]] = 1;
                a.push(item);
            }
        }
    }

    return a;
}
Array.prototype.Filter = function (fn) {
    if (this == undefined || this == null || this.length == 0 || typeof (fn) != 'function')
        return null;
    var a = [];
    for (var i = 0; i < this.length; i++) {
        var item = this[i];
        if (fn(item, i, a))
            a.push(item);
    }
    return a;
}
Array.prototype.find = function (fn) {
    if (this == undefined || this == null || this.length == 0)
        return null;
    for (var i = 0; i < this.length; i++) {
        var item = fn(this[i]);
        if (item != null)
            return item;
    }
    return null;
}
Array.prototype.findMany = function (fn, names) {
    if (this == undefined || this == null || this.length == 0)
        return null;

    var a = [];
    for (var i = 0; i < this.length; i++) {
        var item = fn(this[i]);
        if (item != null) {
            if (Array.isArray(names) == true && names.length > 0) {
                var t = {};
                t[names[0]] = this[i];
                t[names[1]] = item;

                a.push(t);
            } else {
                a.push(item);
            }
        }

    }
    return a;
}
Array.prototype.union = function (array2) {
    if (!Array.isArray(array2))
        return this;

    for (var i = 0; i < array2.length; i++) {
        this.push(array2[i]);
    }
    return this;
}
Array.prototype.addRange = function (array2) {
    if (!Array.isArray(array2))
        return this;

    for (var i = 0; i < array2.length; i++) {
        this.push(array2[i]);
    }
    return this;
}
Array.prototype.removeDuplicate = function (array2, fnItem) {
    if (array2 == null || array2 == [] || array2.length == 0 || typeof (fnItem) != 'function')
        return this;
    var arr = [];
    for (var i = 0; i < this.length; i++) {
        var didNotFindEqual = true;
        var thisValue = fnItem(this[i]);
        for (var k = 0; k < array2.length; k++) {
            didNotFindEqual = didNotFindEqual && thisValue != fnItem(array2[k]);
        }
        if (didNotFindEqual) {
            arr.push(this[i]);
        }
    }
    return arr;
};
Array.prototype.include = function (array2) {
    return this.union(array2);
};
Array.prototype.includeBefore = function (array2) {
    if (array2 == null)
        return this;
    if (!Array.isArray(array2) && typeof (array2) == 'object') {
        array2 = [array2];
    }

    for (var i = 0; i < array2.length; i++) {
        this.unshift(array2[i]);
    }
    return this;
};
Array.prototype.sumProduct = function (array2) {
    if (this == null || this.length == 0)
        return 0;
    if (Array.isArray(array2)) {
        if (array2.length != this.length)
            return 0;

        var s = 0;
        for (var i = 0; i < this.length; i++) {
            s += parseFloat(this[i]) * parseFloat(array2[i]);
        }
        return s;
    } else if (typeof (array2) == 'number') {
        var s = 0;
        for (var i = 0; i < this.length; i++) {
            s += parseFloat(this[i]) * array2;
        }
        return s;
    }

}
Array.prototype.sum = function (prop) {
    if (this == null || this.length == 0)
        return 0;

    var s = 0;
    if (prop == null) {
        for (var i = 0; i < this.length; i++) {
            s += parseFloat(this[i]);
        }
    } else {
        for (var i = 0; i < this.length; i++) {
            if (this[i][prop] != null) {
                if (typeof (this[i][prop]) == 'function') {
                    s += parseFloat(this[i][prop]()||0);
                }else if (isNaN(this[i][prop]) == false) {
                    s += parseFloat(this[i][prop]);
                }
                    
            }
              
        }
    }

    return s;
};
Array.prototype.avg = function (prop) {
    var c = this.length;
    if (c > 0) {
        return this.sum(prop) / c;
    }
    return 0;
}
Array.prototype.orderBy = function (prop) {
    if (this == null || this.length == 0)
        return this;

    if (prop == null)
        return this.sort(function (a, b) { return a - b });

    if (isNaN(this[0][prop])) {
        return this.sort(function (a, b) {
            return a[prop].localeCompare(b[prop]);
        });
    } else {
        return this.sort(function (a, b) {
            return a[prop] - b[prop];
        });
    }


};
Array.prototype.orderDescBy = function (prop) {
    if (this == null || this.length == 0)
        return this;

    if (prop == null)
        return this;


    if (isNaN(this[0][prop])) {
        return this.sort(function (a, b) {
            return b[prop].localeCompare(a[prop]);
        });
    } else {
        return this.sort(function (a, b) {
            return b[prop] - a[prop];
        });
    }

};
Array.prototype.hasSameValuesAs = function(array){
    if(Array.isArray(array) == false || array == null || array.length != this.length)
        return false;
    
    for(var i=0;i<this.length;i++){
        if(this[i] != array[i])
            return false;
    }
    return true;
    
}
Array.prototype.hasAnyTrueOnSameIndex = function(array){
    if(Array.isArray(array) == false || array == null || array.length != this.length)
    return false;


    for(var i =0, len = this.length;i<len;i++){
        if(this[i] == true && array[i] == true)
            return true;
    }

    return false;

}
Array.prototype.compare = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l = this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
}
Array.prototype.convertToInt = function (prop) {
    if (this.length == 0 || typeof (prop) == 'object')
        return

    if (prop == null) {
        for (var i = 0; i < this.length; i++) {
            this[i] = parseInt(this[i]);
        }
        return this;
    }
    if (typeof (prop) == 'string') {
        this.foreach(function (item) { item[prop] = parseInt(item[prop]); });
        return this;
    }

}
Array.prototype.groupBy = function (prop) {
    var k = [];
    for (var i = 0; i < this.length; i++) {
        var item = this[i];
        var search = {};

        var index = k.first({ group: item[prop] });
        if (index != null) {
            index.values.push(item);
        } else {
            var a = { group: item[prop], values: [] };
            a.values.push(item);
            k.push(a);
        }
    }
    return k;
}
Array.prototype.contains = function (array2, prop) {
    if (this.length == 0 || array2.length == 0 || array2[0].hasOwnProperty(prop) == false)
        return [];
    var a = [];
    var k =0;
    for (var i = 0; i < this.length; i++) {
        if (array2.indexOf(this[i][prop]) >= 0) {
            a[k] = this[i];
            k++;
        }
    }
    return k
}
if (Object.getOwnPropertyDescriptor(Array.prototype, 'foreach') == undefined) {
    Object.defineProperty(Array.prototype, "foreach", {
        enumerable: false,
        value: function (fn) {
            if (this == null || typeof (fn) != 'function')
                return;

            for (var i = 0; i < this.length; i++) {
                fn(this[i], i);
            }
        }
    });
}
if (Object.getOwnPropertyDescriptor(Object.prototype, 'every') == undefined) {
    Object.defineProperty(Object.prototype, "every", {
        enumerable: false,
        value: function (fn) {
            if (this == null || typeof (fn) != 'function')
                return;
            var keys = Object.keys(this);
            for (var i = 0; i < keys.length; i++) {
                fn(this[keys[i]], keys[i])
            }
        }
    });
}
//####################################################
//               String ->
//####################################################
String.prototype.last = function () {
    if (this == null || this == '' || typeof (this) != 'object')
        return null;
    return this[this.length - 1]
}
String.prototype.first = function () {
    if (this == null || this == '' || typeof (this) != 'object')
        return null;
    return this[0];
}
var Latinise = {}; Latinise.latin_map = { "Á": "A", "Ă": "A", "Ắ": "A", "Ặ": "A", "Ằ": "A", "Ẳ": "A", "Ẵ": "A", "Ǎ": "A", "Â": "A", "Ấ": "A", "Ậ": "A", "Ầ": "A", "Ẩ": "A", "Ẫ": "A", "Ä": "A", "Ǟ": "A", "Ȧ": "A", "Ǡ": "A", "Ạ": "A", "Ȁ": "A", "À": "A", "Ả": "A", "Ȃ": "A", "Ā": "A", "Ą": "A", "Å": "A", "Ǻ": "A", "Ḁ": "A", "Ⱥ": "A", "Ã": "A", "Ꜳ": "AA", "Æ": "AE", "Ǽ": "AE", "Ǣ": "AE", "Ꜵ": "AO", "Ꜷ": "AU", "Ꜹ": "AV", "Ꜻ": "AV", "Ꜽ": "AY", "Ḃ": "B", "Ḅ": "B", "Ɓ": "B", "Ḇ": "B", "Ƀ": "B", "Ƃ": "B", "Ć": "C", "Č": "C", "Ç": "C", "Ḉ": "C", "Ĉ": "C", "Ċ": "C", "Ƈ": "C", "Ȼ": "C", "Ď": "D", "Ḑ": "D", "Ḓ": "D", "Ḋ": "D", "Ḍ": "D", "Ɗ": "D", "Ḏ": "D", "ǲ": "D", "ǅ": "D", "Đ": "D", "Ƌ": "D", "Ǳ": "DZ", "Ǆ": "DZ", "É": "E", "Ĕ": "E", "Ě": "E", "Ȩ": "E", "Ḝ": "E", "Ê": "E", "Ế": "E", "Ệ": "E", "Ề": "E", "Ể": "E", "Ễ": "E", "Ḙ": "E", "Ë": "E", "Ė": "E", "Ẹ": "E", "Ȅ": "E", "È": "E", "Ẻ": "E", "Ȇ": "E", "Ē": "E", "Ḗ": "E", "Ḕ": "E", "Ę": "E", "Ɇ": "E", "Ẽ": "E", "Ḛ": "E", "Ꝫ": "ET", "Ḟ": "F", "Ƒ": "F", "Ǵ": "G", "Ğ": "G", "Ǧ": "G", "Ģ": "G", "Ĝ": "G", "Ġ": "G", "Ɠ": "G", "Ḡ": "G", "Ǥ": "G", "Ḫ": "H", "Ȟ": "H", "Ḩ": "H", "Ĥ": "H", "Ⱨ": "H", "Ḧ": "H", "Ḣ": "H", "Ḥ": "H", "Ħ": "H", "Í": "I", "Ĭ": "I", "Ǐ": "I", "Î": "I", "Ï": "I", "Ḯ": "I", "İ": "I", "Ị": "I", "Ȉ": "I", "Ì": "I", "Ỉ": "I", "Ȋ": "I", "Ī": "I", "Į": "I", "Ɨ": "I", "Ĩ": "I", "Ḭ": "I", "Ꝺ": "D", "Ꝼ": "F", "Ᵹ": "G", "Ꞃ": "R", "Ꞅ": "S", "Ꞇ": "T", "Ꝭ": "IS", "Ĵ": "J", "Ɉ": "J", "Ḱ": "K", "Ǩ": "K", "Ķ": "K", "Ⱪ": "K", "Ꝃ": "K", "Ḳ": "K", "Ƙ": "K", "Ḵ": "K", "Ꝁ": "K", "Ꝅ": "K", "Ĺ": "L", "Ƚ": "L", "Ľ": "L", "Ļ": "L", "Ḽ": "L", "Ḷ": "L", "Ḹ": "L", "Ⱡ": "L", "Ꝉ": "L", "Ḻ": "L", "Ŀ": "L", "Ɫ": "L", "ǈ": "L", "Ł": "L", "Ǉ": "LJ", "Ḿ": "M", "Ṁ": "M", "Ṃ": "M", "Ɱ": "M", "Ń": "N", "Ň": "N", "Ņ": "N", "Ṋ": "N", "Ṅ": "N", "Ṇ": "N", "Ǹ": "N", "Ɲ": "N", "Ṉ": "N", "Ƞ": "N", "ǋ": "N", "Ñ": "N", "Ǌ": "NJ", "Ó": "O", "Ŏ": "O", "Ǒ": "O", "Ô": "O", "Ố": "O", "Ộ": "O", "Ồ": "O", "Ổ": "O", "Ỗ": "O", "Ö": "O", "Ȫ": "O", "Ȯ": "O", "Ȱ": "O", "Ọ": "O", "Ő": "O", "Ȍ": "O", "Ò": "O", "Ỏ": "O", "Ơ": "O", "Ớ": "O", "Ợ": "O", "Ờ": "O", "Ở": "O", "Ỡ": "O", "Ȏ": "O", "Ꝋ": "O", "Ꝍ": "O", "Ō": "O", "Ṓ": "O", "Ṑ": "O", "Ɵ": "O", "Ǫ": "O", "Ǭ": "O", "Ø": "O", "Ǿ": "O", "Õ": "O", "Ṍ": "O", "Ṏ": "O", "Ȭ": "O", "Ƣ": "OI", "Ꝏ": "OO", "Ɛ": "E", "Ɔ": "O", "Ȣ": "OU", "Ṕ": "P", "Ṗ": "P", "Ꝓ": "P", "Ƥ": "P", "Ꝕ": "P", "Ᵽ": "P", "Ꝑ": "P", "Ꝙ": "Q", "Ꝗ": "Q", "Ŕ": "R", "Ř": "R", "Ŗ": "R", "Ṙ": "R", "Ṛ": "R", "Ṝ": "R", "Ȑ": "R", "Ȓ": "R", "Ṟ": "R", "Ɍ": "R", "Ɽ": "R", "Ꜿ": "C", "Ǝ": "E", "Ś": "S", "Ṥ": "S", "Š": "S", "Ṧ": "S", "Ş": "S", "Ŝ": "S", "Ș": "S", "Ṡ": "S", "Ṣ": "S", "Ṩ": "S", "Ť": "T", "Ţ": "T", "Ṱ": "T", "Ț": "T", "Ⱦ": "T", "Ṫ": "T", "Ṭ": "T", "Ƭ": "T", "Ṯ": "T", "Ʈ": "T", "Ŧ": "T", "Ɐ": "A", "Ꞁ": "L", "Ɯ": "M", "Ʌ": "V", "Ꜩ": "TZ", "Ú": "U", "Ŭ": "U", "Ǔ": "U", "Û": "U", "Ṷ": "U", "Ü": "U", "Ǘ": "U", "Ǚ": "U", "Ǜ": "U", "Ǖ": "U", "Ṳ": "U", "Ụ": "U", "Ű": "U", "Ȕ": "U", "Ù": "U", "Ủ": "U", "Ư": "U", "Ứ": "U", "Ự": "U", "Ừ": "U", "Ử": "U", "Ữ": "U", "Ȗ": "U", "Ū": "U", "Ṻ": "U", "Ų": "U", "Ů": "U", "Ũ": "U", "Ṹ": "U", "Ṵ": "U", "Ꝟ": "V", "Ṿ": "V", "Ʋ": "V", "Ṽ": "V", "Ꝡ": "VY", "Ẃ": "W", "Ŵ": "W", "Ẅ": "W", "Ẇ": "W", "Ẉ": "W", "Ẁ": "W", "Ⱳ": "W", "Ẍ": "X", "Ẋ": "X", "Ý": "Y", "Ŷ": "Y", "Ÿ": "Y", "Ẏ": "Y", "Ỵ": "Y", "Ỳ": "Y", "Ƴ": "Y", "Ỷ": "Y", "Ỿ": "Y", "Ȳ": "Y", "Ɏ": "Y", "Ỹ": "Y", "Ź": "Z", "Ž": "Z", "Ẑ": "Z", "Ⱬ": "Z", "Ż": "Z", "Ẓ": "Z", "Ȥ": "Z", "Ẕ": "Z", "Ƶ": "Z", "Ĳ": "IJ", "Œ": "OE", "ᴀ": "A", "ᴁ": "AE", "ʙ": "B", "ᴃ": "B", "ᴄ": "C", "ᴅ": "D", "ᴇ": "E", "ꜰ": "F", "ɢ": "G", "ʛ": "G", "ʜ": "H", "ɪ": "I", "ʁ": "R", "ᴊ": "J", "ᴋ": "K", "ʟ": "L", "ᴌ": "L", "ᴍ": "M", "ɴ": "N", "ᴏ": "O", "ɶ": "OE", "ᴐ": "O", "ᴕ": "OU", "ᴘ": "P", "ʀ": "R", "ᴎ": "N", "ᴙ": "R", "ꜱ": "S", "ᴛ": "T", "ⱻ": "E", "ᴚ": "R", "ᴜ": "U", "ᴠ": "V", "ᴡ": "W", "ʏ": "Y", "ᴢ": "Z", "á": "a", "ă": "a", "ắ": "a", "ặ": "a", "ằ": "a", "ẳ": "a", "ẵ": "a", "ǎ": "a", "â": "a", "ấ": "a", "ậ": "a", "ầ": "a", "ẩ": "a", "ẫ": "a", "ä": "a", "ǟ": "a", "ȧ": "a", "ǡ": "a", "ạ": "a", "ȁ": "a", "à": "a", "ả": "a", "ȃ": "a", "ā": "a", "ą": "a", "ᶏ": "a", "ẚ": "a", "å": "a", "ǻ": "a", "ḁ": "a", "ⱥ": "a", "ã": "a", "ꜳ": "aa", "æ": "ae", "ǽ": "ae", "ǣ": "ae", "ꜵ": "ao", "ꜷ": "au", "ꜹ": "av", "ꜻ": "av", "ꜽ": "ay", "ḃ": "b", "ḅ": "b", "ɓ": "b", "ḇ": "b", "ᵬ": "b", "ᶀ": "b", "ƀ": "b", "ƃ": "b", "ɵ": "o", "ć": "c", "č": "c", "ç": "c", "ḉ": "c", "ĉ": "c", "ɕ": "c", "ċ": "c", "ƈ": "c", "ȼ": "c", "ď": "d", "ḑ": "d", "ḓ": "d", "ȡ": "d", "ḋ": "d", "ḍ": "d", "ɗ": "d", "ᶑ": "d", "ḏ": "d", "ᵭ": "d", "ᶁ": "d", "đ": "d", "ɖ": "d", "ƌ": "d", "ı": "i", "ȷ": "j", "ɟ": "j", "ʄ": "j", "ǳ": "dz", "ǆ": "dz", "é": "e", "ĕ": "e", "ě": "e", "ȩ": "e", "ḝ": "e", "ê": "e", "ế": "e", "ệ": "e", "ề": "e", "ể": "e", "ễ": "e", "ḙ": "e", "ë": "e", "ė": "e", "ẹ": "e", "ȅ": "e", "è": "e", "ẻ": "e", "ȇ": "e", "ē": "e", "ḗ": "e", "ḕ": "e", "ⱸ": "e", "ę": "e", "ᶒ": "e", "ɇ": "e", "ẽ": "e", "ḛ": "e", "ꝫ": "et", "ḟ": "f", "ƒ": "f", "ᵮ": "f", "ᶂ": "f", "ǵ": "g", "ğ": "g", "ǧ": "g", "ģ": "g", "ĝ": "g", "ġ": "g", "ɠ": "g", "ḡ": "g", "ᶃ": "g", "ǥ": "g", "ḫ": "h", "ȟ": "h", "ḩ": "h", "ĥ": "h", "ⱨ": "h", "ḧ": "h", "ḣ": "h", "ḥ": "h", "ɦ": "h", "ẖ": "h", "ħ": "h", "ƕ": "hv", "í": "i", "ĭ": "i", "ǐ": "i", "î": "i", "ï": "i", "ḯ": "i", "ị": "i", "ȉ": "i", "ì": "i", "ỉ": "i", "ȋ": "i", "ī": "i", "į": "i", "ᶖ": "i", "ɨ": "i", "ĩ": "i", "ḭ": "i", "ꝺ": "d", "ꝼ": "f", "ᵹ": "g", "ꞃ": "r", "ꞅ": "s", "ꞇ": "t", "ꝭ": "is", "ǰ": "j", "ĵ": "j", "ʝ": "j", "ɉ": "j", "ḱ": "k", "ǩ": "k", "ķ": "k", "ⱪ": "k", "ꝃ": "k", "ḳ": "k", "ƙ": "k", "ḵ": "k", "ᶄ": "k", "ꝁ": "k", "ꝅ": "k", "ĺ": "l", "ƚ": "l", "ɬ": "l", "ľ": "l", "ļ": "l", "ḽ": "l", "ȴ": "l", "ḷ": "l", "ḹ": "l", "ⱡ": "l", "ꝉ": "l", "ḻ": "l", "ŀ": "l", "ɫ": "l", "ᶅ": "l", "ɭ": "l", "ł": "l", "ǉ": "lj", "ſ": "s", "ẜ": "s", "ẛ": "s", "ẝ": "s", "ḿ": "m", "ṁ": "m", "ṃ": "m", "ɱ": "m", "ᵯ": "m", "ᶆ": "m", "ń": "n", "ň": "n", "ņ": "n", "ṋ": "n", "ȵ": "n", "ṅ": "n", "ṇ": "n", "ǹ": "n", "ɲ": "n", "ṉ": "n", "ƞ": "n", "ᵰ": "n", "ᶇ": "n", "ɳ": "n", "ñ": "n", "ǌ": "nj", "ó": "o", "ŏ": "o", "ǒ": "o", "ô": "o", "ố": "o", "ộ": "o", "ồ": "o", "ổ": "o", "ỗ": "o", "ö": "o", "ȫ": "o", "ȯ": "o", "ȱ": "o", "ọ": "o", "ő": "o", "ȍ": "o", "ò": "o", "ỏ": "o", "ơ": "o", "ớ": "o", "ợ": "o", "ờ": "o", "ở": "o", "ỡ": "o", "ȏ": "o", "ꝋ": "o", "ꝍ": "o", "ⱺ": "o", "ō": "o", "ṓ": "o", "ṑ": "o", "ǫ": "o", "ǭ": "o", "ø": "o", "ǿ": "o", "õ": "o", "ṍ": "o", "ṏ": "o", "ȭ": "o", "ƣ": "oi", "ꝏ": "oo", "ɛ": "e", "ᶓ": "e", "ɔ": "o", "ᶗ": "o", "ȣ": "ou", "ṕ": "p", "ṗ": "p", "ꝓ": "p", "ƥ": "p", "ᵱ": "p", "ᶈ": "p", "ꝕ": "p", "ᵽ": "p", "ꝑ": "p", "ꝙ": "q", "ʠ": "q", "ɋ": "q", "ꝗ": "q", "ŕ": "r", "ř": "r", "ŗ": "r", "ṙ": "r", "ṛ": "r", "ṝ": "r", "ȑ": "r", "ɾ": "r", "ᵳ": "r", "ȓ": "r", "ṟ": "r", "ɼ": "r", "ᵲ": "r", "ᶉ": "r", "ɍ": "r", "ɽ": "r", "ↄ": "c", "ꜿ": "c", "ɘ": "e", "ɿ": "r", "ś": "s", "ṥ": "s", "š": "s", "ṧ": "s", "ş": "s", "ŝ": "s", "ș": "s", "ṡ": "s", "ṣ": "s", "ṩ": "s", "ʂ": "s", "ᵴ": "s", "ᶊ": "s", "ȿ": "s", "ɡ": "g", "ᴑ": "o", "ᴓ": "o", "ᴝ": "u", "ť": "t", "ţ": "t", "ṱ": "t", "ț": "t", "ȶ": "t", "ẗ": "t", "ⱦ": "t", "ṫ": "t", "ṭ": "t", "ƭ": "t", "ṯ": "t", "ᵵ": "t", "ƫ": "t", "ʈ": "t", "ŧ": "t", "ᵺ": "th", "ɐ": "a", "ᴂ": "ae", "ǝ": "e", "ᵷ": "g", "ɥ": "h", "ʮ": "h", "ʯ": "h", "ᴉ": "i", "ʞ": "k", "ꞁ": "l", "ɯ": "m", "ɰ": "m", "ᴔ": "oe", "ɹ": "r", "ɻ": "r", "ɺ": "r", "ⱹ": "r", "ʇ": "t", "ʌ": "v", "ʍ": "w", "ʎ": "y", "ꜩ": "tz", "ú": "u", "ŭ": "u", "ǔ": "u", "û": "u", "ṷ": "u", "ü": "u", "ǘ": "u", "ǚ": "u", "ǜ": "u", "ǖ": "u", "ṳ": "u", "ụ": "u", "ű": "u", "ȕ": "u", "ù": "u", "ủ": "u", "ư": "u", "ứ": "u", "ự": "u", "ừ": "u", "ử": "u", "ữ": "u", "ȗ": "u", "ū": "u", "ṻ": "u", "ų": "u", "ᶙ": "u", "ů": "u", "ũ": "u", "ṹ": "u", "ṵ": "u", "ᵫ": "ue", "ꝸ": "um", "ⱴ": "v", "ꝟ": "v", "ṿ": "v", "ʋ": "v", "ᶌ": "v", "ⱱ": "v", "ṽ": "v", "ꝡ": "vy", "ẃ": "w", "ŵ": "w", "ẅ": "w", "ẇ": "w", "ẉ": "w", "ẁ": "w", "ⱳ": "w", "ẘ": "w", "ẍ": "x", "ẋ": "x", "ᶍ": "x", "ý": "y", "ŷ": "y", "ÿ": "y", "ẏ": "y", "ỵ": "y", "ỳ": "y", "ƴ": "y", "ỷ": "y", "ỿ": "y", "ȳ": "y", "ẙ": "y", "ɏ": "y", "ỹ": "y", "ź": "z", "ž": "z", "ẑ": "z", "ʑ": "z", "ⱬ": "z", "ż": "z", "ẓ": "z", "ȥ": "z", "ẕ": "z", "ᵶ": "z", "ᶎ": "z", "ʐ": "z", "ƶ": "z", "ɀ": "z", "ﬀ": "ff", "ﬃ": "ffi", "ﬄ": "ffl", "ﬁ": "fi", "ﬂ": "fl", "ĳ": "ij", "œ": "oe", "ﬆ": "st", "ₐ": "a", "ₑ": "e", "ᵢ": "i", "ⱼ": "j", "ₒ": "o", "ᵣ": "r", "ᵤ": "u", "ᵥ": "v", "ₓ": "x" };
String.prototype.removeAccent = function () { return this.replace(/[^A-Za-z0-9\[\] ]/g, function (a) { return Latinise.latin_map[a] || a }) };
String.prototype.startWith = function (txt) {
    if (txt == null || txt == '')
        return false;

    return this.substring(0, txt.length).toLowerCase() == txt.toLowerCase();
}
String.prototype.format = function () {
    if (this == null || this.trim() == '')
        return '';

    var txt = this;
    for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] != null) {
            txt = txt.replace('{' + i + '}', arguments[i]);
        }
    }
    return txt;
}
String.prototype.trimLeft = function () {
    if (this == '')
        return this;
    var txt = this;
    while (this.first() == ' ') {
        txt = this.substring(1);
    }
    return txt.toString();
}
String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
String.prototype.countOccurrencesOf = function (search) {
    var g = this.match(new RegExp(search, 'g'));
    return (g || []).length;
}
//####################################################
//               Common Function ->
//####################################################
function isSafeToUse(obj, prop) {
    try {
        if (obj == undefined || obj == null || prop == null || prop == '')
            return false;

        if (prop.indexOf('.') >= 0) {
            var s = prop.split('.');
            var k = obj;
            for (var i = 0; i < s.length; i++) {
                if (typeof (k[s[i]]) != 'undefined' && k[s[i]] != null) {
                    k = k[s[i]];
                } else {
                    return false;
                }
            }
            return true;
        } else {
            return typeof (obj[prop]) != 'undefined' && obj[prop] != null;
        }
    } catch (e) {
        return false;
    }

}
function isNotSafeToUse(obj, prop) {
    return isSafeToUse(obj, prop) == false;
}
function compareIfSafe(obj, prop, value) {
    try {
        if (typeof (obj) == 'undefined')
            return false;

        var item = getPropertyByName(obj, prop);
        return item != null ? item == value : false;
    } catch (e) {
        return false;
    }

}
function getPropertyByName(obj, prop, runFunction) {
    try {
        if (prop == '' || prop == null || prop == undefined) {
            if (obj != undefined && obj != null) {
                return obj;
            } else {
                return null;
            }
        }
        if (isSafeToUse(obj, prop)) {
            if (prop.indexOf('.') >= 0) {
                var s = prop.split('.');
                var k = obj;
                for (var i = 0; i < s.length; i++) {
                    if (k.hasOwnProperty(s[i])) {
                        k = k[s[i]];
                    } else {
                        return null;
                    }
                }
                return k;
            } else {
                if (typeof (obj[prop]) == 'function' && (runFunction == null || runFunction == true)) {
                    return obj[prop]();
                } else {
                    return obj[prop];
                }
            }
        }
        return null;
    } catch (e) {
        return null;
    }
};
function getPropertyByNameOrDefault(obj, prop, defaultValue) {
    try {
        if (prop == '' || prop == null || prop == undefined) {
            if (obj != undefined && obj != null) {
                return obj;
            } else {
                return defaultValue;
            }
        }
        if (isSafeToUse(obj, prop)) {
            if (prop.indexOf('.') >= 0) {
                var s = prop.split('.');
                var k = obj;
                for (var i = 0; i < s.length; i++) {
                    if (k.hasOwnProperty(s[i])) {
                        k = k[s[i]];
                    } else {
                        return defaultValue;
                    }
                }
                return k;
            } else {
                return obj[prop];
            }
        }
        return defaultValue;
    } catch (e) {
        return null;
    }
};
function setIfSafe(obj, prop, value) {
    try {
        if (obj == undefined || obj == null || prop == null || prop == '')
            return false;

        if (prop.indexOf('.') >= 0) {
            var s = prop.split('.');
            var k = obj;
            for (var i = 0; i < s.length - 1; i++) {
                if (typeof (k[s[i]]) != 'undefined' && k[s[i]] != null) {
                    k = k[s[i]];
                } else {
                    return false;
                }
            }
            if (typeof (k[s.last()]) != 'undefined') {
                k[s.last()] = value;
                return true;
            } else {
                return false;
            }

        } else {
            if (typeof (obj[prop]) != 'undefined') {
                obj[prop] = value;
                return true;
            }
            return false;
        }
    } catch (e) {
        return false;
    }
}
function valueIfUndefined(prop, value) {
    if (prop == undefined || prop == null) {
        return value;
    } else {
        return prop;
    }
}
function falseIfUndefined(prop) {
    return valueIfUndefined(prop, false);
}
function trueIfUndefined(prop) {
    return valueIfUndefined(prop, true);
}
function callIfSafe(obj, fn) {
    var f = getPropertyByName(obj, fn, false);
    if (f != null && typeof (f) == 'function') {
        if (arguments.length > 2) {
            var str = f.toString();
            var param = [];
            for (var i = 2; i < arguments.length; i++) {
                param[i - 2] = arguments[i];
            }
            f.apply(this, param);
        } else {
            f();
        }
    }
}
function singleLookup(obj, value) {
    if (obj == null)
        return null;

    for (i in obj) {
        if (obj[i] == value)
            return i;
    }
    return null;
}
function copyAllPropersTo(base, objToCopy) {
    for (var i in objToCopy) {
        if (typeof(objToCopy[i]) != 'undefined')
            base[i] = objToCopy[i];
    }
};
function copyPropersTo(base, objToCopy, props) {
    for (var i = 0; i < props.length; i++) {
        prop = props[i];
        if (typeof (objToCopy[prop]) != 'undefined')
            base[prop] = objToCopy[prop];
    }
};

function isBetween(value, low, high){
    return value >= low && value <= high
}

function classUtil(me){
    me.toast = function(msg){
        Materialize.toast(msg, 4000) ;
    }
    me.toastOk = function(msg){
        Materialize.toast(msg, 30000, '', function(){

        }) ;
    }
}
function toastCallback(){
    $('.toast').fadeOut();
}

function checkVisible(elm, evalType) {
    evalType = evalType || "visible";

    var vpH = $(window).height(), // Viewport Height
        st = $(window).scrollTop(), // Scroll Top
        y = $(elm).offset().top,
        elementHeight = $(elm).height();

    if (evalType === "visible") return ((y < (vpH + st)) && (y > (st - elementHeight)));
    if (evalType === "above") return ((y < (vpH + st)));
}