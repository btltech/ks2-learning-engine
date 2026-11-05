import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AccessibilitySettingsModal } from './AccessibilitySettings';
import { UISettingsProvider } from '../context/UISettingsContext';
import { accessibilityService } from '../services/accessibilityService';
import { disableKokoro, enableKokoro, getKokoroState } from '../services/kokoroTTS';
vi.mock('../services/kokoroTTS', () => ({ getKokoroState: vi.fn(() => ({ status:'off', progress:0 })), subscribeKokoro: () => () => {}, enableKokoro:vi.fn(), disableKokoro:vi.fn() }));
beforeEach(() => { localStorage.clear(); accessibilityService.resetSettings(); vi.clearAllMocks(); vi.mocked(getKokoroState).mockReturnValue({status:'off',progress:0}); });
afterEach(() => { cleanup(); accessibilityService.resetSettings(); });
const open = (ui = false) => render(ui ? <UISettingsProvider userAge={9}><AccessibilitySettingsModal onClose={vi.fn()}/></UISettingsProvider> : <AccessibilitySettingsModal onClose={vi.fn()}/>);
const choose = (group:string, name:string) => fireEvent.click(within(screen.getByRole('group', {name:group})).getByRole('button', {name,exact:true}));
describe('Voice and display preferences', () => {
  it('saves appearance, restores it when reopened and updates the live example without a UI provider', () => {
    const view=open(); choose('Colours','Dark');
    expect(document.documentElement).toHaveClass('appearance-dark');
    expect(JSON.parse(localStorage.getItem('ks2_accessibility_settings')!).appearance).toBe('dark');
    expect(within(screen.getByLabelText('Live display example')).getByRole('status')).toHaveTextContent('Dark colours');
    view.unmount(); open();
    expect(within(screen.getByRole('group',{name:'Colours'})).getByRole('button',{name:'Dark'})).toHaveAttribute('aria-pressed','true');
    choose('Colours','Calm tint'); expect(document.documentElement).toHaveClass('appearance-calm');
    choose('Colours','High Contrast Mode'); expect(document.documentElement).toHaveClass('high-contrast');
    choose('Colours','Standard'); expect(document.documentElement).not.toHaveClass('high-contrast','appearance-dark','appearance-calm');
  });
  it('turns both sources of large text, contrast and motion off after enabling them', () => {
    open(true); choose('Text size','Large'); choose('Colours','High Contrast Mode');
    fireEvent.click(screen.getByRole('switch',{name:'Reduced Motion'}));
    expect(document.documentElement).toHaveClass('large-text','sunny-large-text','high-contrast','sunny-high-contrast','reduce-motion');
    choose('Text size','Standard'); choose('Colours','Standard'); fireEvent.click(screen.getByRole('switch',{name:'Reduced Motion'}));
    expect(document.documentElement).not.toHaveClass('large-text','sunny-large-text','high-contrast','sunny-high-contrast','reduce-motion','accessibility-reduced-motion');
    const saved=JSON.parse(localStorage.getItem('ks2_ui_settings')!);
    expect(saved).toMatchObject({largerText:false,highContrast:false,reducedAnimations:false,mode:'standard',showClassroomMode:true});
  });
  it('retains original audio switches, voice callbacks and the full speech speed range', () => {
    open(); fireEvent.click(screen.getByRole('switch',{name:'Text-to-Speech'}));
    fireEvent.click(screen.getByRole('switch',{name:'Natural English Voice'})); expect(enableKokoro).toHaveBeenCalledOnce(); expect(disableKokoro).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Speech Speed'),{target:{value:'1.7'}});
    expect(accessibilityService.getSettings().ttsSpeed).toBe(1.7);
    fireEvent.click(screen.getByRole('button',{name:'Slower',exact:true})); expect(accessibilityService.getSettings().ttsSpeed).toBe(0.8);
    fireEvent.click(screen.getByRole('switch',{name:'Sound Effects'})); expect(accessibilityService.getSettings().soundEffects).toBe(false);
    fireEvent.click(screen.getByRole('switch',{name:'Text-to-Speech'})); expect(screen.queryByRole('switch',{name:'Natural English Voice'})).toBeNull();
    expect(accessibilityService.getSettings().textToSpeech).toBe(false);
  });
  it('keeps the natural voice disable callback when an enabled voice is shown', () => {
    accessibilityService.updateSetting('textToSpeech',true);
    vi.mocked(getKokoroState).mockReturnValue({status:'ready',progress:1});
    open(); fireEvent.click(screen.getByRole('switch',{name:'Natural English Voice'}));
    expect(disableKokoro).toHaveBeenCalledOnce(); expect(enableKokoro).not.toHaveBeenCalled();
  });
  it('retains all reading and interaction preferences and reset confirmation', () => {
    open(true);
    for(const name of ['Dyslexia-Friendly Font','Screen Reader Optimized','Extended Time Limits','Keyboard Navigation','Focus Highlight']) fireEvent.click(screen.getByRole('switch',{name}));
    fireEvent.change(screen.getByLabelText('Color Blind Mode'),{target:{value:'deuteranopia'}});
    fireEvent.change(screen.getByLabelText('Click Target Size'),{target:{value:'extra-large'}});
    expect(accessibilityService.getSettings()).toMatchObject({dyslexiaFriendlyFont:true,screenReaderOptimized:true,extendedTimeLimit:true,keyboardNavigation:false,focusHighlight:false,colorBlindMode:'deuteranopia',clickTargetSize:'extra-large'});
    expect(document.body).toHaveAttribute('role','application');
    const confirm=vi.spyOn(window,'confirm').mockReturnValue(false);
    fireEvent.click(screen.getByRole('button',{name:'Reset to Defaults'})); expect(accessibilityService.getSettings().extendedTimeLimit).toBe(true);
    confirm.mockReturnValue(true); fireEvent.click(screen.getByRole('button',{name:'Reset to Defaults'}));
    expect(accessibilityService.getSettings()).toMatchObject({appearance:'standard',clickTargetSize:'normal',textToSpeech:false,keyboardNavigation:true,focusHighlight:true});
    expect(document.body).not.toHaveAttribute('role'); confirm.mockRestore();
  });
});
