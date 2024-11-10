<script lang="ts">
  import { remult, type UserInfo } from 'remult'

  let userInfo: UserInfo | undefined = $state(undefined)
  $effect(() => {
    remult.initUser().then((user) => {
      userInfo = user
    })
  })
</script>

<pre>{JSON.stringify(userInfo, null, 2)}</pre>
