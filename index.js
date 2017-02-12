"use strict";

const Matter = require('matter-js');

/**
 * An attractors plugin for matter.js.
 * See the readme for usage and examples.
 * @module MatterAttractors
 */
const MatterAttractors = {
  // plugin meta
  name: 'matter-attractors', // PLUGIN_NAME
  version: '0.1.4', // PLUGIN_VERSION
  for: 'matter-js@^0.12.0',

  // installs the plugin where `base` is `Matter`
  // you should not need to call this directly.
  install: function(base) {
    base.after('Body.create', function() {
      MatterAttractors.Body.init(this);
    });

    base.before('Engine.update', function(engine) {
      MatterAttractors.Engine.update(engine);
    });
  },

  Body: {
    /**
     * Initialises the `body` to support attractors.
     * This is called automatically by the plugin.
     * @function MatterAttractors.Body.init
     * @param {Matter.Body} body The body to init.
     * @returns {void} No return value.
     */
    init: function(body) {
      body.plugin.attractors = body.plugin.attractors || [];
    }
  },

  Engine: {
    /**
     * Applies all attractors for all bodies in the `engine`.
     * This is called automatically by the plugin.
     * @function MatterAttractors.Engine.update
     * @param {Matter.Engine} engine The engine to update.
     * @returns {void} No return value.
     */
    update: function(engine) {
      let world = engine.world,
        bodies = Matter.Composite.allBodies(world);

      for (let i = 0; i < bodies.length; i += 1) {
        let bodyA = bodies[i],
          attractors = bodyA.plugin.attractors;

        if (attractors && attractors.length > 0) {
          for (let j = i + 1; j < bodies.length; j += 1) {
            let bodyB = bodies[j];

            for (let k = 0; k < attractors.length; k += 1) {
              let attractor = attractors[k],
                forceVector = attractor;

              if (Matter.Common.isFunction(attractor)) {
                forceVector = attractor(bodyA, bodyB);
              }
              
              if (forceVector) {
                Matter.Body.applyForce(bodyB, bodyB.position, forceVector);
              }
            }
          }
        }
      }
    }
  }
};

Matter.Plugin.register(MatterAttractors);

module.exports = MatterAttractors;

/**
 * @namespace Matter.Body
 * @see http://brm.io/matter-js/docs/classes/Body.html
 */

/**
 * This plugin adds a new property `body.plugin.attractors` to instances of `Matter.Body`.  
 * This is an array of callback functions that will be called automatically
 * for every pair of bodies, on every engine update.
 * @property {Function[]} body.plugin.attractors
 * @memberof Matter.Body
 */

/**
 * An attractor function calculates the force to be applied
 * between two bodies, it should either:
 * - return the force vector to be applied to `bodyB`
 * - or apply the force to the body(s) itself
 * @callback AttractorFunction
 * @param {Matter.Body} bodyA
 * @param {Matter.Body} bodyB
 * @returns {Vector|undefined} a force vector (optional)
 */