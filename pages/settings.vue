<template>
  <div class="w-full h-full px-4 py-8 overflow-y-auto">
    <!-- Display settings -->
    <p class="uppercase text-xs font-semibold text-fg-muted mb-2">{{ $strings.HeaderUserInterfaceSettings }}</p>
    <div class="flex items-center py-3">
      <div class="w-10 flex justify-center" @click="toggleEnableAltView">
        <ui-toggle-switch v-model="enableBookshelfView" @input="saveSettings" />
      </div>
      <p class="pl-4">{{ $strings.LabelUseBookshelfView }}</p>
    </div>
    <!-- screen.orientation.lock not supported on iOS webview -->
    <div v-if="!isiOS" class="flex items-center py-3">
      <div class="w-10 flex justify-center" @click.stop="toggleLockOrientation">
        <ui-toggle-switch v-model="lockCurrentOrientation" class="pointer-events-none" />
      </div>
      <p class="pl-4">{{ $strings.LabelLockOrientation }}</p>
    </div>
    <div class="py-3 flex items-center">
      <p class="pr-4 w-36">{{ $strings.LabelHapticFeedback }}</p>
      <div @click.stop="showHapticFeedbackOptions">
        <ui-text-input :value="hapticFeedbackOption" readonly append-icon="expand_more" style="max-width: 200px" />
      </div>
    </div>
    <div class="py-3 flex items-center">
      <p class="pr-4 w-36">{{ $strings.LabelLanguage }}</p>
      <div @click.stop="showLanguageOptions">
        <ui-text-input :value="languageOption" readonly append-icon="expand_more" style="max-width: 200px" />
      </div>
    </div>
    <div class="py-3 flex items-center">
      <p class="pr-4 w-36">{{ $strings.LabelTheme }}</p>
      <div @click.stop="showThemeOptions">
        <ui-text-input :value="themeOption" readonly append-icon="expand_more" style="max-width: 200px" />
      </div>
    </div>
    <div class="py-3 flex items-center">
      <p class="pr-4 w-36">Profil UI</p>
      <div @click.stop="showSkinOptions">
        <ui-text-input :value="activeSkinLabel" readonly append-icon="expand_more" style="max-width: 200px" />
      </div>
    </div>
    <div class="py-3">
      <p class="text-sm text-fg-muted mb-1">Remote theme URL</p>
      <div class="flex items-center gap-2">
        <ui-text-input v-model="remoteThemeUrl" placeholder="https://example.com/theme.json" style="flex: 1" />
        <button class="px-3 py-2 bg-accent text-white rounded-md text-sm" @click.stop="saveRemoteThemeUrl">Apply</button>
      </div>
      <p class="text-xs text-fg-muted mt-1">JSON with CSS vars: {"--color-bg":"10 10 10"}</p>
    </div>

    <!-- Remote UI -->
    <div class="py-3 mt-4 border border-border rounded-xl px-4">
      <p class="text-sm font-semibold text-fg mb-2">Remote UI</p>
      <div class="flex items-center justify-between py-1">
        <p class="text-sm text-fg">Zapnout vzdálené UI</p>
        <div class="relative w-12 h-6 cursor-pointer" @click.stop="toggleRemoteUi">
          <div class="absolute inset-0 rounded-full transition-colors" :class="remoteUiEnabled ? 'bg-accent' : 'bg-bg-hover'" />
          <div class="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform" :class="remoteUiEnabled ? 'translate-x-7' : 'translate-x-1'" />
        </div>
      </div>
      <div class="mt-2">
        <p class="text-xs text-fg-muted mb-1">URL vzdáleného frontendu</p>
        <div class="flex items-center gap-2">
          <ui-text-input v-model="remoteUiUrl" placeholder="https://custom-ui.example.com" style="flex: 1" />
          <button class="px-3 py-2 bg-accent text-white rounded-md text-sm" @click.stop="saveRemoteUi">Uložit</button>
        </div>
      </div>
      <p v-if="remoteUiEnabled" class="text-xs text-yellow-400 mt-2">Po uložení se přepneš do remote frontendu. Lokální UI bude pozastaveno.</p>
    </div>

    <!-- App update -->
    <div class="py-3 mt-4 border border-border rounded-xl px-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-semibold text-fg">Aktualizace aplikace</p>
          <p class="text-xs text-fg-muted mt-0.5">Verze {{ appVersion }}</p>
        </div>
        <button class="px-3 py-2 bg-accent text-white rounded-md text-sm flex items-center gap-1.5" :disabled="updateChecking" @click.stop="checkForUpdate">
          <span class="material-symbols text-base leading-none">{{ updateChecking ? 'hourglass_empty' : 'system_update' }}</span>
          {{ updateChecking ? 'Kontroluji...' : 'Zkontrolovat' }}
        </button>
      </div>
      <div v-if="updateAvailable" class="mt-3 p-3 bg-accent/10 rounded-lg flex items-center justify-between">
        <div>
          <p class="text-sm font-semibold text-accent">Dostupná {{ updateAvailable.version }}</p>
          <p class="text-xs text-fg-muted">Klikni pro stažení a instalaci</p>
        </div>
        <button class="px-3 py-2 bg-accent text-white rounded-md text-sm flex items-center gap-1.5" :disabled="updateDownloading" @click.stop="startUpdate">
          <span class="material-symbols text-base leading-none">download</span>
          {{ updateDownloading ? 'Stahuji...' : 'Instalovat' }}
        </button>
      </div>
      <p v-if="updateUpToDate" class="text-xs text-fg-muted mt-2">✓ Máš nejnovější verzi.</p>
    </div>

    <!-- Playback settings -->
    <p class="uppercase text-xs font-semibold text-fg-muted mb-2 mt-10">{{ $strings.HeaderPlaybackSettings }}</p>
    <div class="py-3 flex items-center">
      <p class="pr-4 w-36">{{ $strings.LabelJumpBackwardsTime }}</p>
      <div @click.stop="showJumpBackwardsOptions">
        <ui-text-input :value="jumpBackwardsOption" readonly append-icon="expand_more" style="width: 145px; max-width: 145px" />
      </div>
    </div>
    <div class="py-3 flex items-center">
      <p class="pr-4 w-36">{{ $strings.LabelJumpForwardsTime }}</p>
      <div @click.stop="showJumpForwardOptions">
        <ui-text-input :value="jumpForwardOption" readonly append-icon="expand_more" style="width: 145px; max-width: 145px" />
      </div>
    </div>
    <div class="flex items-center py-3">
      <div class="w-10 flex justify-center" @click="toggleDisableAutoRewind">
        <ui-toggle-switch v-model="settings.disableAutoRewind" @input="saveSettings" />
      </div>
      <p class="pl-4">{{ $strings.LabelDisableAutoRewind }}</p>
    </div>
    <div v-if="!isiOS" class="flex items-center py-3">
      <div class="w-10 flex justify-center" @click="toggleEnableMp3IndexSeeking">
        <ui-toggle-switch v-model="settings.enableMp3IndexSeeking" @input="saveSettings" />
      </div>
      <p class="pl-4">{{ $strings.LabelEnableMp3IndexSeeking }}</p>
      <span class="material-symbols text-xl ml-2" @click.stop="showConfirmMp3IndexSeeking">info</span>
    </div>
    <div class="flex items-center py-3">
      <div class="w-10 flex justify-center" @click="toggleAllowSeekingOnMediaControls">
        <ui-toggle-switch v-model="settings.allowSeekingOnMediaControls" @input="saveSettings" />
      </div>
      <p class="pl-4">{{ $strings.LabelAllowSeekingOnMediaControls }}</p>
    </div>

    <!-- Sleep timer settings -->
    <template v-if="!isiOS">
      <p class="uppercase text-xs font-semibold text-fg-muted mb-2 mt-10">{{ $strings.HeaderSleepTimerSettings }}</p>
      <div class="flex items-center py-3">
        <div class="w-10 flex justify-center" @click="toggleDisableShakeToResetSleepTimer">
          <ui-toggle-switch v-model="settings.disableShakeToResetSleepTimer" @input="saveSettings" />
        </div>
        <p class="pl-4">{{ $strings.LabelDisableShakeToReset }}</p>
        <span class="material-symbols text-xl ml-2" @click.stop="showInfo('disableShakeToResetSleepTimer')">info</span>
      </div>
      <div v-if="!settings.disableShakeToResetSleepTimer" class="py-3 flex items-center">
        <p class="pr-4 w-36">{{ $strings.LabelShakeSensitivity }}</p>
        <div @click.stop="showShakeSensitivityOptions">
          <ui-text-input :value="shakeSensitivityOption" readonly append-icon="expand_more" style="width: 145px; max-width: 145px" />
        </div>
      </div>
    </template>
    <div class="flex items-center py-3">
      <div class="w-10 flex justify-center" @click="toggleDisableSleepTimerFadeOut">
        <ui-toggle-switch v-model="settings.disableSleepTimerFadeOut" @input="saveSettings" />
      </div>
      <p class="pl-4">{{ $strings.LabelDisableAudioFadeOut }}</p>
      <span class="material-symbols text-xl ml-2" @click.stop="showInfo('disableSleepTimerFadeOut')">info</span>
    </div>
    <template v-if="!isiOS">
      <div class="flex items-center py-3">
        <div class="w-10 flex justify-center" @click="toggleDisableSleepTimerResetFeedback">
          <ui-toggle-switch v-model="settings.disableSleepTimerResetFeedback" @input="saveSettings" />
        </div>
        <p class="pl-4">{{ $strings.LabelDisableVibrateOnReset }}</p>
        <span class="material-symbols text-xl ml-2" @click.stop="showInfo('disableSleepTimerResetFeedback')">info</span>
      </div>
      <div class="flex items-center py-3">
        <div class="w-10 flex justify-center" @click="toggleSleepTimerAlmostDoneChime">
          <ui-toggle-switch v-model="settings.enableSleepTimerAlmostDoneChime" @input="saveSettings" />
        </div>
        <p class="pl-4">{{ $strings.LabelSleepTimerAlmostDoneChime }}</p>
        <span class="material-symbols text-xl ml-2" @click.stop="showInfo('enableSleepTimerAlmostDoneChime')">info</span>
      </div>
      <div class="flex items-center py-3">
        <div class="w-10 flex justify-center" @click="toggleAutoSleepTimer">
          <ui-toggle-switch v-model="settings.autoSleepTimer" @input="saveSettings" />
        </div>
        <p class="pl-4">{{ $strings.LabelAutoSleepTimer }}</p>
        <span class="material-symbols text-xl ml-2" @click.stop="showInfo('autoSleepTimer')">info</span>
      </div>
    </template>
    <!-- Auto Sleep timer settings -->
    <div v-if="settings.autoSleepTimer" class="py-3 flex items-center">
      <p class="pr-4 w-36">{{ $strings.LabelStartTime }}</p>
      <ui-text-input type="time" v-model="settings.autoSleepTimerStartTime" style="width: 145px; max-width: 145px" @input="autoSleepTimerTimeUpdated" />
    </div>
    <div v-if="settings.autoSleepTimer" class="py-3 flex items-center">
      <p class="pr-4 w-36">{{ $strings.LabelEndTime }}</p>
      <ui-text-input type="time" v-model="settings.autoSleepTimerEndTime" style="width: 145px; max-width: 145px" @input="autoSleepTimerTimeUpdated" />
    </div>
    <div v-if="settings.autoSleepTimer" class="py-3 flex items-center">
      <p class="pr-4 w-36">{{ $strings.LabelSleepTimer }}</p>
      <div @click.stop="showSleepTimerOptions">
        <ui-text-input :value="sleepTimerLengthOption" readonly append-icon="expand_more" style="width: 145px; max-width: 145px" />
      </div>
    </div>
    <div v-if="settings.autoSleepTimer" class="flex items-center py-3">
      <div class="w-10 flex justify-center" @click="toggleAutoSleepTimerAutoRewind">
        <ui-toggle-switch v-model="settings.autoSleepTimerAutoRewind" @input="saveSettings" />
      </div>
      <p class="pl-4">{{ $strings.LabelAutoSleepTimerAutoRewind }}</p>
      <span class="material-symbols text-xl ml-2" @click.stop="showInfo('autoSleepTimerAutoRewind')">info</span>
    </div>
    <div v-if="settings.autoSleepTimerAutoRewind" class="py-3 flex items-center">
      <p class="pr-4 w-36">{{ $strings.LabelAutoRewindTime }}</p>
      <div @click.stop="showAutoSleepTimerRewindOptions">
        <ui-text-input :value="autoSleepTimerRewindLengthOption" readonly append-icon="expand_more" style="width: 145px; max-width: 145px" />
      </div>
    </div>

    <!-- Data settings -->
    <p class="uppercase text-xs font-semibold text-fg-muted mb-2 mt-10">{{ $strings.HeaderDataSettings }}</p>
    <div class="py-3 flex items-center">
      <p class="pr-4 w-36">{{ $strings.LabelDownloadUsingCellular }}</p>
      <div @click.stop="showDownloadUsingCellularOptions">
        <ui-text-input :value="downloadUsingCellularOption" readonly append-icon="expand_more" style="max-width: 200px" />
      </div>
    </div>
    <div class="py-3 flex items-center">
      <p class="pr-4 w-36">{{ $strings.LabelStreamingUsingCellular }}</p>
      <div @click.stop="showStreamingUsingCellularOptions">
        <ui-text-input :value="streamingUsingCellularOption" readonly append-icon="expand_more" style="max-width: 200px" />
      </div>
    </div>

    <!-- Android Auto settings -->
    <template v-if="!isiOS">
      <p class="uppercase text-xs font-semibold text-fg-muted mb-2 mt-10">{{ $strings.HeaderAndroidAutoSettings }}</p>
      <div class="py-3 flex items-center">
        <p class="pr-4 w-36">{{ $strings.LabelAndroidAutoBrowseLimitForGrouping }}</p>
        <ui-text-input type="number" v-model="settings.androidAutoBrowseLimitForGrouping" style="width: 145px; max-width: 145px" @input="androidAutoBrowseLimitForGroupingUpdated" />
        <span class="material-symbols text-xl ml-2" @click.stop="showInfo('androidAutoBrowseLimitForGrouping')">info</span>
      </div>
      <div class="py-3 flex items-center">
        <p class="pr-4 w-36">{{ $strings.LabelAndroidAutoBrowseSeriesSequenceOrder }}</p>
        <div @click.stop="showAndroidAutoBrowseSeriesSequenceOrderOptions">
          <ui-text-input :value="androidAutoBrowseSeriesSequenceOrderOption" readonly append-icon="expand_more" style="max-width: 200px" />
        </div>
      </div>
    </template>

    <div v-show="loading" class="w-full h-full absolute top-0 left-0 flex items-center justify-center z-10">
      <ui-loading-indicator />
    </div>

    <modals-dialog v-model="showMoreMenuDialog" :items="moreMenuItems" :selected="moreMenuSelected" @action="clickMenuAction" />
    <modals-sleep-timer-length-modal v-model="showSleepTimerLengthModal" @change="sleepTimerLengthModalSelection" />
    <modals-auto-sleep-timer-rewind-length-modal v-model="showAutoSleepTimerRewindLengthModal" @change="showAutoSleepTimerRewindLengthModalSelection" />
  </div>
</template>

<script>
import { Dialog } from '@capacitor/dialog'
import jumpLabelMixin from '@/mixins/jumpLabel'
import { SKINS } from '@/composables/useSkin'
import { AbsAudioPlayer } from '@/plugins/capacitor'

export default {
  mixins: [jumpLabelMixin],
  data() {
    return {
      loading: false,
      deviceData: null,
      showMoreMenuDialog: false,
      updateChecking: false,
      updateDownloading: false,
      updateAvailable: null,
      updateUpToDate: false,
      showSleepTimerLengthModal: false,
      showAutoSleepTimerRewindLengthModal: false,
      moreMenuSetting: '',
      settings: {
        disableAutoRewind: false,
        enableAltView: true,
        allowSeekingOnMediaControls: false,
        jumpForwardTime: 10,
        jumpBackwardsTime: 10,
        enableMp3IndexSeeking: false,
        disableShakeToResetSleepTimer: false,
        shakeSensitivity: 'MEDIUM',
        lockOrientation: 0,
        hapticFeedback: 'LIGHT',
        autoSleepTimer: false,
        autoSleepTimerStartTime: '22:00',
        autoSleepTimerEndTime: '06:00',
        sleepTimerLength: 900000, // 15 minutes
        disableSleepTimerFadeOut: false,
        disableSleepTimerResetFeedback: false,
        enableSleepTimerAlmostDoneChime: false,
        autoSleepTimerAutoRewind: false,
        autoSleepTimerAutoRewindTime: 300000, // 5 minutes
        languageCode: 'en-us',
        downloadUsingCellular: 'ALWAYS',
        streamingUsingCellular: 'ALWAYS',
        androidAutoBrowseLimitForGrouping: 100,
        androidAutoBrowseSeriesSequenceOrder: 'ASC'
      },
      theme: 'dark',
      remoteThemeUrl: '',
      remoteUiUrl: '',
      remoteUiEnabled: false,
      lockCurrentOrientation: false,
      settingInfo: {
        disableShakeToResetSleepTimer: {
          name: this.$strings.LabelDisableShakeToReset,
          message: this.$strings.LabelDisableShakeToResetHelp
        },
        autoSleepTimer: {
          name: this.$strings.LabelAutoSleepTimer,
          message: this.$strings.LabelAutoSleepTimerHelp
        },
        disableSleepTimerFadeOut: {
          name: this.$strings.LabelDisableAudioFadeOut,
          message: this.$strings.LabelDisableAudioFadeOutHelp
        },
        disableSleepTimerResetFeedback: {
          name: this.$strings.LabelDisableVibrateOnReset,
          message: this.$strings.LabelDisableVibrateOnResetHelp
        },
        enableSleepTimerAlmostDoneChime: {
          name: this.$strings.LabelSleepTimerAlmostDoneChime,
          message: this.$strings.LabelSleepTimerAlmostDoneChimeHelp
        },
        autoSleepTimerAutoRewind: {
          name: this.$strings.LabelAutoSleepTimerAutoRewind,
          message: this.$strings.LabelAutoSleepTimerAutoRewindHelp
        },
        enableMp3IndexSeeking: {
          name: this.$strings.LabelEnableMp3IndexSeeking,
          message: this.$strings.LabelEnableMp3IndexSeekingHelp
        },
        androidAutoBrowseLimitForGrouping: {
          name: this.$strings.LabelAndroidAutoBrowseLimitForGrouping,
          message: this.$strings.LabelAndroidAutoBrowseLimitForGroupingHelp
        }
      },
      hapticFeedbackItems: [
        {
          text: this.$strings.LabelOff,
          value: 'OFF'
        },
        {
          text: this.$strings.LabelLight,
          value: 'LIGHT'
        },
        {
          text: this.$strings.LabelMedium,
          value: 'MEDIUM'
        },
        {
          text: this.$strings.LabelHeavy,
          value: 'HEAVY'
        }
      ],
      shakeSensitivityItems: [
        {
          text: this.$strings.LabelVeryLow,
          value: 'VERY_LOW'
        },
        {
          text: this.$strings.LabelLow,
          value: 'LOW'
        },
        {
          text: this.$strings.LabelMedium,
          value: 'MEDIUM'
        },
        {
          text: this.$strings.LabelHigh,
          value: 'HIGH'
        },
        {
          text: this.$strings.LabelVeryHigh,
          value: 'VERY_HIGH'
        }
      ],
      downloadUsingCellularItems: [
        {
          text: this.$strings.LabelAskConfirmation,
          value: 'ASK'
        },
        {
          text: this.$strings.LabelAlways,
          value: 'ALWAYS'
        },
        {
          text: this.$strings.LabelNever,
          value: 'NEVER'
        }
      ],
      streamingUsingCellularItems: [
        {
          text: this.$strings.LabelAskConfirmation,
          value: 'ASK'
        },
        {
          text: this.$strings.LabelAlways,
          value: 'ALWAYS'
        },
        {
          text: this.$strings.LabelNever,
          value: 'NEVER'
        }
      ],
      androidAutoBrowseSeriesSequenceOrderItems: [
        {
          text: this.$strings.LabelSequenceAscending,
          value: 'ASC'
        },
        {
          text: this.$strings.LabelSequenceDescending,
          value: 'DESC'
        }
      ]
    }
  },
  computed: {
    // This is flipped because alt view was the default until v0.9.61-beta
    enableBookshelfView: {
      get() {
        return !this.settings.enableAltView
      },
      set(val) {
        this.settings.enableAltView = !val
      }
    },
    isiOS() {
      return this.$platform === 'ios'
    },
    jumpForwardSecondsOptions() {
      return this.$store.state.globals.jumpForwardSecondsOptions || []
    },
    jumpBackwardsSecondsOptions() {
      return this.$store.state.globals.jumpBackwardsSecondsOptions || []
    },
    languageOptionItems() {
      return this.$languageCodeOptions || []
    },
    jumpForwardOption() {
      return this.getJumpLabel(this.settings.jumpForwardTime)
    },
    jumpBackwardsOption() {
      return this.getJumpLabel(this.settings.jumpBackwardsTime)
    },
    themeOptionItems() {
      return [
        {
          text: this.$strings.LabelThemeBlack,
          value: 'black'
        },
        {
          text: this.$strings.LabelThemeDark,
          value: 'dark'
        },
        {
          text: this.$strings.LabelThemeLight,
          value: 'light'
        },
        {
          text: 'Kids',
          value: 'kids'
        }
      ]
    },
    shakeSensitivityOption() {
      const item = this.shakeSensitivityItems.find((i) => i.value === this.settings.shakeSensitivity)
      return item?.text || 'Error'
    },
    hapticFeedbackOption() {
      const item = this.hapticFeedbackItems.find((i) => i.value === this.settings.hapticFeedback)
      return item?.text || 'Error'
    },
    languageOption() {
      return this.languageOptionItems.find((i) => i.value === this.settings.languageCode)?.text || ''
    },
    appVersion() {
      return this.$config.version || '?'
    },
    themeOption() {
      return this.themeOptionItems.find((i) => i.value === this.theme)?.text || ''
    },
    skinItems() {
      return Object.values(SKINS).map((s) => ({ value: s.id, text: s.label }))
    },
    activeSkinLabel() {
      return this.skinItems.find((i) => i.value === this.$store.state.activeSkinId)?.text || 'Výchozí'
    },
    sleepTimerLengthOption() {
      if (!this.settings.sleepTimerLength) return this.$strings.LabelEndOfChapter
      const minutes = Number(this.settings.sleepTimerLength) / 1000 / 60
      return `${minutes} min`
    },
    autoSleepTimerRewindLengthOption() {
      const minutes = Number(this.settings.autoSleepTimerAutoRewindTime) / 1000 / 60
      return `${minutes} min`
    },
    downloadUsingCellularOption() {
      const item = this.downloadUsingCellularItems.find((i) => i.value === this.settings.downloadUsingCellular)
      return item?.text || 'Error'
    },
    streamingUsingCellularOption() {
      const item = this.streamingUsingCellularItems.find((i) => i.value === this.settings.streamingUsingCellular)
      return item?.text || 'Error'
    },
    androidAutoBrowseSeriesSequenceOrderOption() {
      const item = this.androidAutoBrowseSeriesSequenceOrderItems.find((i) => i.value === this.settings.androidAutoBrowseSeriesSequenceOrder)
      return item?.text || 'Error'
    },
    moreMenuItems() {
      if (this.moreMenuSetting === 'shakeSensitivity') return this.shakeSensitivityItems
      else if (this.moreMenuSetting === 'hapticFeedback') return this.hapticFeedbackItems
      else if (this.moreMenuSetting === 'language') return this.languageOptionItems
      else if (this.moreMenuSetting === 'theme') return this.themeOptionItems
      else if (this.moreMenuSetting === 'skin') return this.skinItems
      else if (this.moreMenuSetting === 'downloadUsingCellular') return this.downloadUsingCellularItems
      else if (this.moreMenuSetting === 'streamingUsingCellular') return this.streamingUsingCellularItems
      else if (this.moreMenuSetting === 'androidAutoBrowseSeriesSequenceOrder') return this.androidAutoBrowseSeriesSequenceOrderItems
      else if (this.moreMenuSetting === 'jumpForward')
        return this.jumpForwardSecondsOptions.map((value) => ({
          text: this.getJumpLabel(value),
          value: value
        }))
      else if (this.moreMenuSetting === 'jumpBackwards')
        return this.jumpBackwardsSecondsOptions.map((value) => ({
          text: this.getJumpLabel(value),
          value: value
        }))
      return []
    },
    moreMenuSelected() {
      if (this.moreMenuSetting === 'jumpForward') return this.settings.jumpForwardTime
      if (this.moreMenuSetting === 'jumpBackwards') return this.settings.jumpBackwardsTime
      if (this.moreMenuSetting === 'language') return this.settings.languageCode
      if (this.moreMenuSetting === 'theme') return this.theme
      if (this.moreMenuSetting === 'skin') return this.$store.state.activeSkinId
      if (this.moreMenuSetting === 'downloadUsingCellular') return this.settings.downloadUsingCellular
      if (this.moreMenuSetting === 'streamingUsingCellular') return this.settings.streamingUsingCellular
      if (this.moreMenuSetting === 'androidAutoBrowseSeriesSequenceOrder') return this.settings.androidAutoBrowseSeriesSequenceOrder
      if (this.moreMenuSetting === 'shakeSensitivity') return this.settings.shakeSensitivity
      if (this.moreMenuSetting === 'hapticFeedback') return this.settings.hapticFeedback
      return null
    }
  },
  methods: {
    sleepTimerLengthModalSelection(value) {
      this.settings.sleepTimerLength = value
      this.saveSettings()
    },
    showAutoSleepTimerRewindLengthModalSelection(value) {
      this.settings.autoSleepTimerAutoRewindTime = value
      this.saveSettings()
    },
    showSleepTimerOptions() {
      this.showSleepTimerLengthModal = true
    },
    showAutoSleepTimerRewindOptions() {
      this.showAutoSleepTimerRewindLengthModal = true
    },
    showHapticFeedbackOptions() {
      this.moreMenuSetting = 'hapticFeedback'
      this.showMoreMenuDialog = true
    },
    showShakeSensitivityOptions() {
      this.moreMenuSetting = 'shakeSensitivity'
      this.showMoreMenuDialog = true
    },
    showLanguageOptions() {
      this.moreMenuSetting = 'language'
      this.showMoreMenuDialog = true
    },
    showThemeOptions() {
      this.moreMenuSetting = 'theme'
      this.showMoreMenuDialog = true
    },
    async checkForUpdate() {
      this.updateChecking = true
      this.updateAvailable = null
      this.updateUpToDate = false
      try {
        const data = await this.$nativeHttp.get('https://jankoran.cz/abs-updates/latest.json')
        const remoteVersion = (data?.version || '').replace(/^v/, '')
        const current = (this.appVersion || '').replace(/^v/, '')
        if (remoteVersion && remoteVersion !== current) {
          this.updateAvailable = data
        } else {
          this.updateUpToDate = true
        }
      } catch (_) {
        this.$toast.error('Nepodařilo se zkontrolovat aktualizace', { timeout: 3000 })
      } finally {
        this.updateChecking = false
      }
    },
    async startUpdate() {
      if (!this.updateAvailable?.apk_url) return
      this.updateDownloading = true
      try {
        await AbsAudioPlayer.installUpdate({ url: this.updateAvailable.apk_url })
        this.$toast.success('Stahování spuštěno — po dokončení se zobrazí instalační dialog', { timeout: 5000 })
      } catch (_) {
        this.$toast.error('Chyba při spouštění stahování', { timeout: 3000 })
      } finally {
        this.updateDownloading = false
      }
    },
    showSkinOptions() {
      this.moreMenuSetting = 'skin'
      this.showMoreMenuDialog = true
    },
    async setSkin(id) {
      const prev = this.$store.state.activeSkinId
      document.documentElement.dataset.skin = id === 'default' ? '' : id
      await this.$localStore.setSkinId(id)
      this.$store.commit('SET_ACTIVE_SKIN', id)
      if (id !== prev) window.location.reload()
    },
    showJumpForwardOptions() {
      this.moreMenuSetting = 'jumpForward'
      this.showMoreMenuDialog = true
    },
    showJumpBackwardsOptions() {
      this.moreMenuSetting = 'jumpBackwards'
      this.showMoreMenuDialog = true
    },
    showDownloadUsingCellularOptions() {
      this.moreMenuSetting = 'downloadUsingCellular'
      this.showMoreMenuDialog = true
    },
    showStreamingUsingCellularOptions() {
      this.moreMenuSetting = 'streamingUsingCellular'
      this.showMoreMenuDialog = true
    },
    showAndroidAutoBrowseSeriesSequenceOrderOptions() {
      this.moreMenuSetting = 'androidAutoBrowseSeriesSequenceOrder'
      this.showMoreMenuDialog = true
    },
    clickMenuAction(action) {
      this.showMoreMenuDialog = false
      if (this.moreMenuSetting === 'shakeSensitivity') {
        this.settings.shakeSensitivity = action
        this.saveSettings()
      } else if (this.moreMenuSetting === 'hapticFeedback') {
        this.settings.hapticFeedback = action
        this.hapticFeedbackUpdated(action)
      } else if (this.moreMenuSetting === 'language') {
        this.settings.languageCode = action
        this.saveSettings()
      } else if (this.moreMenuSetting === 'theme') {
        this.theme = action
        this.saveTheme(action)
      } else if (this.moreMenuSetting === 'skin') {
        this.setSkin(action)
      } else if (this.moreMenuSetting === 'downloadUsingCellular') {
        this.settings.downloadUsingCellular = action
        this.saveSettings()
      } else if (this.moreMenuSetting === 'streamingUsingCellular') {
        this.settings.streamingUsingCellular = action
        this.saveSettings()
      } else if (this.moreMenuSetting === 'androidAutoBrowseSeriesSequenceOrder') {
        this.settings.androidAutoBrowseSeriesSequenceOrder = action
        this.saveSettings()
      } else if (this.moreMenuSetting === 'jumpForward') {
        this.settings.jumpForwardTime = action
        this.saveSettings()
      } else if (this.moreMenuSetting === 'jumpBackwards') {
        this.settings.jumpBackwardsTime = action
        this.saveSettings()
      }
    },
    saveTheme(theme) {
      document.documentElement.dataset.theme = theme
      this.$localStore.setTheme(theme)
    },
    async toggleRemoteUi() {
      this.remoteUiEnabled = !this.remoteUiEnabled
      await this.$localStore.setRemoteUiEnabled(this.remoteUiEnabled)
    },
    async saveRemoteUi() {
      const url = this.remoteUiUrl.trim()
      await this.$localStore.setRemoteUiUrl(url)
      await this.$localStore.setRemoteUiEnabled(this.remoteUiEnabled)
      this.$toast.success('Remote UI nastavení uloženo', { timeout: 2000 })
      if (this.remoteUiEnabled && url) {
        window.location.reload()
      }
    },
    saveRemoteThemeUrl() {
      const url = this.remoteThemeUrl.trim()
      this.$localStore.setRemoteThemeUrl(url)
      if (!url) {
        const el = document.getElementById('remote-theme')
        if (el) el.remove()
        return
      }
      fetch(url)
        .then((r) => r.json())
        .then((json) => {
          let el = document.getElementById('remote-theme')
          if (!el) {
            el = document.createElement('style')
            el.id = 'remote-theme'
            document.head.appendChild(el)
          }
          el.textContent = `:root { ${Object.entries(json)
            .map(([k, v]) => `${k}:${v}`)
            .join(';')} }`
          this.$toast.success('Remote theme applied')
        })
        .catch(() => this.$toast.error('Failed to load remote theme'))
    },
    autoSleepTimerTimeUpdated(val) {
      if (!val) return // invalid times return falsy
      this.saveSettings()
    },
    androidAutoBrowseLimitForGroupingUpdated(val) {
      if (!val) return // invalid times return falsy
      if (val > 1000) val = 1000
      if (val < 30) val = 30
      this.saveSettings()
    },
    hapticFeedbackUpdated(val) {
      this.$store.commit('globals/setHapticFeedback', val)
      this.saveSettings()
    },
    showInfo(setting) {
      if (this.settingInfo[setting]) {
        Dialog.alert({
          title: this.settingInfo[setting].name,
          message: this.settingInfo[setting].message
        })
      }
    },
    async showConfirmMp3IndexSeeking() {
      const confirmResult = await Dialog.confirm({
        title: this.settingInfo.enableMp3IndexSeeking.name,
        message: this.settingInfo.enableMp3IndexSeeking.message,
        cancelButtonTitle: 'View More'
      })
      if (!confirmResult.value) {
        window.open('https://exoplayer.dev/troubleshooting.html#why-is-seeking-inaccurate-in-some-mp3-files', '_blank')
      }
    },
    toggleEnableMp3IndexSeeking() {
      this.settings.enableMp3IndexSeeking = !this.settings.enableMp3IndexSeeking
      this.saveSettings()
    },
    toggleAutoSleepTimer() {
      this.settings.autoSleepTimer = !this.settings.autoSleepTimer
      this.saveSettings()
    },
    toggleAutoSleepTimerAutoRewind() {
      this.settings.autoSleepTimerAutoRewind = !this.settings.autoSleepTimerAutoRewind
      this.saveSettings()
    },
    toggleDisableSleepTimerFadeOut() {
      this.settings.disableSleepTimerFadeOut = !this.settings.disableSleepTimerFadeOut
      this.saveSettings()
    },
    toggleDisableShakeToResetSleepTimer() {
      this.settings.disableShakeToResetSleepTimer = !this.settings.disableShakeToResetSleepTimer
      this.saveSettings()
    },
    toggleDisableSleepTimerResetFeedback() {
      this.settings.disableSleepTimerResetFeedback = !this.settings.disableSleepTimerResetFeedback
      this.saveSettings()
    },
    toggleSleepTimerAlmostDoneChime() {
      this.settings.enableSleepTimerAlmostDoneChime = !this.settings.enableSleepTimerAlmostDoneChime
      this.saveSettings()
    },
    toggleDisableAutoRewind() {
      this.settings.disableAutoRewind = !this.settings.disableAutoRewind
      this.saveSettings()
    },
    toggleEnableAltView() {
      this.settings.enableAltView = !this.settings.enableAltView
      this.saveSettings()
    },
    toggleAllowSeekingOnMediaControls() {
      this.settings.allowSeekingOnMediaControls = !this.settings.allowSeekingOnMediaControls
      this.saveSettings()
    },
    getCurrentOrientation() {
      const orientation = window.screen?.orientation || {}
      const type = orientation.type || ''

      if (type.includes('landscape')) return 'LANDSCAPE'
      return 'PORTRAIT' // default
    },
    toggleLockOrientation() {
      this.lockCurrentOrientation = !this.lockCurrentOrientation
      if (this.lockCurrentOrientation) {
        this.settings.lockOrientation = this.getCurrentOrientation()
      } else {
        this.settings.lockOrientation = 'NONE'
      }
      this.$setOrientationLock(this.settings.lockOrientation)
      this.saveSettings()
    },
    async saveSettings() {
      await this.$hapticsImpact()
      const updatedDeviceData = await this.$db.updateDeviceSettings({ ...this.settings })
      if (updatedDeviceData) {
        this.$store.commit('setDeviceData', updatedDeviceData)
        this.deviceData = updatedDeviceData
        this.$setLanguageCode(updatedDeviceData.deviceSettings?.languageCode || 'en-us')
        this.setDeviceSettings()
      }
    },
    setDeviceSettings() {
      const deviceSettings = this.deviceData.deviceSettings || {}
      this.settings.disableAutoRewind = !!deviceSettings.disableAutoRewind
      this.settings.enableAltView = !!deviceSettings.enableAltView
      this.settings.allowSeekingOnMediaControls = !!deviceSettings.allowSeekingOnMediaControls
      this.settings.jumpForwardTime = deviceSettings.jumpForwardTime || 10
      this.settings.jumpBackwardsTime = deviceSettings.jumpBackwardsTime || 10
      this.settings.enableMp3IndexSeeking = !!deviceSettings.enableMp3IndexSeeking

      this.settings.lockOrientation = deviceSettings.lockOrientation || 'NONE'
      this.lockCurrentOrientation = this.settings.lockOrientation !== 'NONE'
      this.settings.hapticFeedback = deviceSettings.hapticFeedback || 'LIGHT'

      this.settings.disableShakeToResetSleepTimer = !!deviceSettings.disableShakeToResetSleepTimer
      this.settings.shakeSensitivity = deviceSettings.shakeSensitivity || 'MEDIUM'
      this.settings.autoSleepTimer = !!deviceSettings.autoSleepTimer
      this.settings.autoSleepTimerStartTime = deviceSettings.autoSleepTimerStartTime || '22:00'
      this.settings.autoSleepTimerEndTime = deviceSettings.autoSleepTimerEndTime || '06:00'
      this.settings.sleepTimerLength = !isNaN(deviceSettings.sleepTimerLength) ? deviceSettings.sleepTimerLength : 900000 // 15 minutes
      this.settings.disableSleepTimerFadeOut = !!deviceSettings.disableSleepTimerFadeOut
      this.settings.disableSleepTimerResetFeedback = !!deviceSettings.disableSleepTimerResetFeedback
      this.settings.enableSleepTimerAlmostDoneChime = !!deviceSettings.enableSleepTimerAlmostDoneChime

      this.settings.autoSleepTimerAutoRewind = !!deviceSettings.autoSleepTimerAutoRewind
      this.settings.autoSleepTimerAutoRewindTime = !isNaN(deviceSettings.autoSleepTimerAutoRewindTime) ? deviceSettings.autoSleepTimerAutoRewindTime : 300000 // 5 minutes

      this.settings.languageCode = deviceSettings.languageCode || 'en-us'

      this.settings.downloadUsingCellular = deviceSettings.downloadUsingCellular || 'ALWAYS'
      this.settings.streamingUsingCellular = deviceSettings.streamingUsingCellular || 'ALWAYS'

      this.settings.androidAutoBrowseLimitForGrouping = deviceSettings.androidAutoBrowseLimitForGrouping
      this.settings.androidAutoBrowseSeriesSequenceOrder = deviceSettings.androidAutoBrowseSeriesSequenceOrder || 'ASC'
    },
    async init() {
      this.loading = true
      this.theme = (await this.$localStore.getTheme()) || 'dark'
      this.remoteThemeUrl = (await this.$localStore.getRemoteThemeUrl()) || ''
      this.remoteUiUrl = (await this.$localStore.getRemoteUiUrl()) || ''
      this.remoteUiEnabled = await this.$localStore.getRemoteUiEnabled()
      this.deviceData = await this.$db.getDeviceData()
      this.$store.commit('setDeviceData', this.deviceData)
      this.setDeviceSettings()
      this.loading = false
    }
  },
  mounted() {
    this.init()
  }
}
</script>
