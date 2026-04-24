import { ref, onMounted } from 'vue'

const isDark = ref(false)

export function useDarkMode() {
  onMounted(() => {
    const saved = localStorage.getItem('darkMode')
    isDark.value = saved === 'true'
    updateHtmlClass()
  })

  const toggleDarkMode = () => {
    isDark.value = !isDark.value
    localStorage.setItem('darkMode', isDark.value)
    updateHtmlClass()
  }

  const updateHtmlClass = () => {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return {
    isDark,
    toggleDarkMode
  }
}
