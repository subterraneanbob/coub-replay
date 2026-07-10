<script lang="ts">
  let { title } = $props();
</script>

<div class="ms-divider">
  <span>{title}</span>
</div>

<style>
  * {
    --divider-color: rgb(var(--light-text-color));
  }

  .ms-divider {
    display: flex;
    align-items: center;
    text-align: center;
    margin: 0;
    margin-inline-start: 1rem;
    margin-inline-end: 1rem;
  }

  .ms-divider::before,
  .ms-divider::after {
    content: "";
    flex: 1;
    border-bottom: 1px solid var(--divider-color);
  }

  .ms-divider:not(:empty)::before {
    margin-inline-end: 0.8rem;
  }

  .ms-divider:not(:empty)::after {
    margin-inline-start: 0.8rem;
  }

  .ms-divider span {
    font-size: 0.8rem;
    font-weight: bold;
    color: var(--divider-color);
    text-transform: uppercase;
  }
</style>
