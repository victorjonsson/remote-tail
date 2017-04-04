'use strict';

module.exports = ObjectBag;

/**
 * 
 * @constructor
 */
function ObjectBag() {
    this.bag = {};
    this.index = 0;
    this.numItemsInBag = 0;
}

ObjectBag.prototype.save = function(obj) {
    if (obj.bagObjectId && obj.bagObjectId in this.bag) {
        throw new Error('Object already in the bag...');
    }
    obj.bagObjectId = (++this.index).toString();
    this.bag[obj.bagObjectId] = obj;
    this.numItemsInBag++;
};

ObjectBag.prototype.fetch = function(bagObjectId) {
    return this.bag[bagObjectId];
};

ObjectBag.prototype.remove = function(objectOrBagObjectId) {
    const bagObjectId = objectOrBagObjectId.bagObjectId || objectOrBagObjectId;
    if (bagObjectId in this.bag) {
        delete this.bag[bagObjectId];
        this.numItemsInBag--;
    }
};

ObjectBag.prototype.each = function(cb) {
    Object.keys(this.bag).forEach((bagObjectId) => {
        cb(this.bag[bagObjectId]);
    });
};

ObjectBag.prototype.size = function() {
    return this.numItemsInBag;
};

