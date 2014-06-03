exports.definition = {
  config: {
    columns: {
      uuid: "TEXT"
    },
    defaults: {
    },
    adapter: {
      type: "sql",
      collection_name: "user"
    }
  },

  extendModel: function(Model) {
    _.extend(Model.prototype, {
    }); // end extend

    return Model;
  },

  extendCollection: function(Collection) {
      _.extend(Collection.prototype, {
  }); // end extend

      return Collection;
  }
};
