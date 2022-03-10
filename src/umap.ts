const _ = require('lodash');
const Q = require('q');
const superagent = require('superagent');

interface UmapdlOptions {
    resolveRemote?: boolean;
    mapId?: number;
    domain?: string;
}

const requestUrlLayer = (url: URL, mapId: number, options: UmapdlOptions) =>  {
    return superagent
        .get(url)
        .set('Accept', '*/*')
        .set('Accept-Encoding', 'gzip, deflate')
        .set('Accept-Language', 'en-US,en;q=0.9,de-DE;q=0.8,de;q=0.7')
        .set('Cache-Control', 'no-cache')
        .set('Connection', 'keep-alive')
        .set('DNT', '1')
        .set('Host', `umap.openstreetmap.${options.domain}`)
        .set('Pragma', 'no-cache')
        .set('Referer', `https://umap.openstreetmap.${options.domain}/en/map/x_${mapId}`)
        .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3423.2 Safari/537.36')
        .set('X-Requested-With', 'XMLHttpRequest')
        // Parse layer json
        .then((response: { text: string; }) => JSON.parse(response.text));
};

const requestIdLayer = (id: number, mapId: number, options: UmapdlOptions) => {
    return requestUrlLayer(new URL(`https://umap.openstreetmap.${options.domain}/en/datalayer/${id}/`), mapId, options);
};

const requestMap = (id: number, options: UmapdlOptions) => {
    return superagent
        .get(`https://umap.openstreetmap.${options.domain}/en/map/x_${id}`)
        .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8')
        .set('Accept-Encoding', 'gzip, deflate')
        .set('Accept-Language', 'en-US,en;q=0.9,de-DE;q=0.8,de;q=0.7')
        .set('Cache-Control', 'no-cache')
        .set('Connection', 'keep-alive')
        .set('DNT', '1')
        .set('Host', `umap.openstreetmap.${options.domain}`)
        .set('Pragma', 'no-cache')
        .set('Upgrade-Insecure-Requests', '1')
        .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3423.2 Safari/537.36')
        // Pares umap json (extract data from html)
        .then((response: { text: string; }) => JSON.parse(/<script[^>]*?>\s*var MAP = new L\.U\.Map\([^\{]+([\s\S]+?)\);\s*<\/script>/.exec(response.text)[1]))
};

export const umap = {

    normalizeFeature: function (feature: { properties: { _umap_options: any; _storage_options: any; }; }, options = {}) {
        // Rename storage to umap options
        if (_.result(feature, 'properties._storage_options')) {
            feature.properties._umap_options = feature.properties._storage_options;
            delete feature.properties._storage_options;
        }

        return Q(feature);
    },

    normalizeLayer: function (layer: { _storage: any; _umap_options: { remoteData: {}; }; features: any[]; }, options: UmapdlOptions = {}) {
        // Rename storage to umap options
        if (layer._storage) {
            layer._umap_options = layer._storage;
            delete layer._storage;
        }

        // Resolve remote layer data
        const remoteUrl = options.resolveRemote && _.result(layer, '_umap_options.remoteData.url');

        if (remoteUrl) {
            return requestUrlLayer(remoteUrl, options.mapId, options)
                .then((remoteLayer: any) => umap.normalizeLayer(remoteLayer, options))
                .then((remoteLayer: { features: any; }) => {
                    // Replace features by remote data
                    layer.features = remoteLayer.features;

                    // Remove remote reference
                    layer._umap_options.remoteData = {};

                    return layer;
                });
        }

        // Normalize features;
        const promises = layer.features.map((feature: any) => umap.normalizeFeature(feature, options));

        return Q.all(promises)
            .then((features: any) => {
                layer.features = features;

                return layer;
            });
    },

    normalize: function (data: { properties: any; }, options: UmapdlOptions = {}) {
        let map: { type: string; properties: any; layers: any; };

        map = _.pick(data, ['geometry']);
        map.type = 'umap';
        map.properties = _.pick(data.properties, ['easing', 'embedControl', 'fullscreenControl', 'searchControl', 'datalayersControl', 'zoomControl', 'slideshow', 'captionBar', 'limitBounds', 'tilelayer', 'licence', 'description', 'name', 'displayPopupFooter', 'miniMap', 'moreControl', 'scaleControl', 'scrollWheelZoom', 'zoom', 'layers']);

        // Normalize layers
        const promises = (map.layers || []).map((layer: any) => umap.normalizeLayer(layer, options));

        return Q.all(promises)
            .then((layers: any) => {
                map.layers = layers;

                return map;
            });
    },

    downloadLayer: function (id: number, options: UmapdlOptions = {}) {
        return requestIdLayer(id, options.mapId, options)
            .then((body: any) => umap.normalizeLayer(body, options))
            .then((body: any) => ({
                status: 200,
                body: body
            }))
            .catch((error: { status: number; message: string; }) => {
                const status = error.status || 500;
                const message = error.message || (status === 404 ? 'Page not found.' : status === 500 ? 'Internal server error' : 'Error.');

                return {
                    status: status,
                    message: message
                };
            });
    },

    download: function (id: number, options: UmapdlOptions) {
        options = _.extend({
            resolveRemote: false
        }, options, {
            mapId: id
        });

        return requestMap(id, options)
            .then((body: any) => {
                // Get related layers informations
                const datalayers = _.result(body, 'properties.datalayers', []);

                // Format
                return umap.normalize(body)
                    .then((body: any) => {
                        return {
                            body: body,
                            datalayers: datalayers
                        };
                    });
            })
            .then((context: { body: any; datalayers: any[]; }) => {
                const body = context.body;

                // Fetch related layers
                const promises = context.datalayers.map((layer: { id: any; }) => umap.downloadLayer(layer.id, options));

                return Q.all(promises)
                    .then((responses: any[]) => {
                        // Add successful loaded layer
                        responses.map((response: { status: number; body: any; }) => {
                            if (response.status === 200) {
                                body.layers.push(response.body);
                            }

                        });

                        return body;
                    });
            })
            // Result
            .then((body: any) => {                
                return JSON.stringify(body, null, 4)
            });
    }
};
