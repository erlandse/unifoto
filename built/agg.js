var aggObject = {
    "size": 0,
    "aggs": {
        "tema": {
            "terms": {
                "field": "tema",
                "order": {
                    "_term": "asc"
                },
                "size": 1000
            }
        }
    }
};
var wListQuery = {
    "tags": {
        "terms": {
            "field": "alledata",
            "include": "",
            "order": { "_term": "asc" }
        }
    }
};
var wordListQuery = {
    "tags": {
        "terms": {
            "field": "alledata",
            "include": ""
        }
    }
};
var sortPhoto = [
    { "foto_kort_id": "asc" }
];
