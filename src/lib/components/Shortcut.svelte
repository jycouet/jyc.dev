<script lang="ts">
  interface Props {
    binds: string[]
    run: () => void
  }

  let { binds, run }: Props = $props()

  function keybind(element: any, options: any) {
    // Now we're also expecting `{binds: string[]}` as a provided
    // option. Which will contain a set of bound keys like `["Control", "h"]`
    let { binds, run } = options

    // Here, we're creating a `Map<string, boolean>` which contains the keys we need to
    // listen for with boolean flags. However we need to convert them into
    // `[string, boolean]` pairs so `Map` knows how to create the associations.
    let lookup = new Map(binds.map((key: string) => [key, false]))

    function on_key_down(event: KeyboardEvent) {
      if (event.repeat) return

      // With our dynamic lookup, we've greatly simplified from a switch-case.
      if (lookup.has(event.key)) {
        event.preventDefault()

        lookup.set(event.key, true)
      }

      // But we've traded that earlier complexity for needing to loop all of
      // our bound key flags.
      for (const [key, flag] of lookup) {
        // If any flag is `false`, we just early return to skip.
        if (!flag) return
      }

      run()
    }

    function on_key_up(event: KeyboardEvent) {
      // Here, just like `on_key_down`, we do the same but flagging `false`.
      if (lookup.has(event.key)) {
        lookup.set(event.key, false)
      }
    }

    window.addEventListener('keydown', on_key_down)
    window.addEventListener('keyup', on_key_up)

    return {
      destroy() {
        window.removeEventListener('keydown', on_key_down)
        window.removeEventListener('keyup', on_key_up)
      },

      update(options: any) {
        // Since we're supporting reactive options, we need to reinitialize
        // a new lookup `Map` with the new keys and to dump the old state.
        ;({ binds, run } = options)

        lookup = new Map(binds.map((key: string) => [key, false]))
      },
    }
  }
</script>

<svelte:window use:keybind={{ binds, run }} />
