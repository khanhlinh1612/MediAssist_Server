module.exports = {
    multipleMongooseObjectHandlers: function (mongooseObjects) {
        return mongooseObjects.map((object) => object.toObject());
    },
    singleMongooseObjectHandlers: function (mongooseObject) {
        return mongooseObject ? mongooseObject.toObject() : mongooseObject;
    },
};
