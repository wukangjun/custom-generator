var Emmiter = require('events')
var { AutoGeneratorError, error } = require('./error')

/**
 * var line = new FactoryAssemblyLine([fn, fn, fn])
 * line.start()
 */
class FactoryAssemblyLine extends Emmiter {
  constructor(fns) {
    super()

    this.middlewares = []
    this.on('onerror', function(err) {
      if (err.name === 'AutoGeneratorError') {
        error(err.message)
      } else {
        console.log()
        console.error(err)
        console.log()
      }
    })
    if (fns && !Array.isArray(fns)) {
      throw new AutoGeneratorError(
        'The `FactoryAssemblyLine` constructor takes the first parameter should be an Array')
    } else {
      this.middlewares = this.middlewares.concat(fns || [])
    }
  }

  // fn frist parameter is args
  // fn second parameter is next function
  compose() {
    return async (entry) => {
      var len = this.middlewares.length
      var next = async () => Promise.resolve()
      var nextFactory = (middleware, prevNext) => {
        return async () => {
          try {
            await middleware(entry, prevNext)
          } catch (err) {
            this.emit('onerror', err)
          }
        }
      }

      for (var i = len - 1; i >= 0; i--) {
        var currentMiddleware = this.middlewares[i]
        next = nextFactory(currentMiddleware, next)
      }
      await next()
    }
  }

  pipe(fn) {
    if (typeof fn !== 'function') {
      throw new AutoGeneratorError(
        'The pipe parameter in the FactoryAssemblyLine must be a function!')
    }
    this.middlewares.push(fn)
    return this
  }

  start() {
    this.compose().apply(this, arguments)
  }

  onerror(fn) {
    if (typeof fn !== 'function') {
      throw new AutoGeneratorError(
        'The `onerror` of `FactoryAssemblyLine` arguments fn must be a function!')
    }
    this.on('onerror', fn)
    return this
  }
}

module.exports = FactoryAssemblyLine