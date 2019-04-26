
module.exports = {
  router: {
    entry: 'test/pages',
    output: 'test/router/config.js',
    pattern: '**/index.js',
    replace: {
      component: '{router}'
    }
  },
  struct: {
    pages: [
      { type: 'file', name: 'index.js', template: '{index}' },
      { type: 'file', name: '<inherits>.vue', template: '{avue}' },
      { type: 'dir', name: 'src' },
      {
        type: 'dir', name: 'style',
        children: [
          {
            type: 'file',
            name: 'index.scss', 
            template: '{style}'
          }
        ]
      }
    ]
  },
  template: {
    router: `() => import('@/pages[component]')`,
    index: `export default {}`,
    style: `.app-container {}`,
    avue: `
      <template>
        <section class="app-container [inherit]"></section>
      </template>

      <script>
        /** 
         * 
         * @since: [now]
        */
        export default {
          name: inherit
        }
      </script>

      <style>
      @import './style/index.scss'
      </style>
    `
  },
  variable: {
    
  }
}