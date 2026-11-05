import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AvatarConfig, AvatarItem } from '../services/avatarCustomizationService';

const fixture=vi.hoisted(()=>({config:{character:'char_robot',characterColor:'color_blue',hat:null,accessory:null,background:'bg_white',effect:null,frame:null} as AvatarConfig,equip:vi.fn(),unlockedItems:[] as string[]}));
const items:AvatarItem[]=[
  {id:'char_robot',name:'Robot',category:'character',icon:'🤖',unlockCondition:{type:'default'},rarity:'common'},
  {id:'char_alien',name:'Alien',category:'character',icon:'👽',unlockCondition:{type:'default'},rarity:'common'},
  {id:'char_ninja',name:'Ninja',category:'character',icon:'🥷',unlockCondition:{type:'xp',value:500},rarity:'rare'},
  {id:'char_unicorn',name:'Unicorn',category:'character',icon:'🦄',unlockCondition:{type:'achievement',value:'perfect_week'},rarity:'legendary'},
  {id:'color_blue',name:'Blue',category:'character',icon:'🔵',color:'#3B82F6',unlockCondition:{type:'default'},rarity:'common'},
  {id:'bg_white',name:'White',category:'background',icon:'⬜',unlockCondition:{type:'default'},rarity:'common'},
  {id:'effect_sparkle',name:'Sparkles',category:'effect',icon:'✨',unlockCondition:{type:'default'},rarity:'common'},
];
vi.mock('../context/UserContext',()=>({useUser:()=>({user:{unlockedItems:fixture.unlockedItems}})}));
vi.mock('../services/avatarCustomizationService',()=>({avatarCustomizationService:{
  getConfig:()=>({...fixture.config}),getAllItems:()=>items,getItemsByCategory:(category:string)=>items.filter(item=>item.category===category),
  getUnlockedItems:()=>items.filter(item=>item.unlockCondition.type==='default'),syncWithStorePurchases:()=>[],checkAllUnlocks:()=>[],
  getUnlockProgress:(id:string)=>({progressText:id==='char_unicorn'?'Earn \"perfect_week\" achievement':'Earn 500 XP'}),getRarityColor:()=> '#172033',
  getAvatarDisplay:()=>({character:fixture.config.character==='char_alien'?'👽':'🤖',color:'#3B82F6',hat:null,accessory:null,background:'⬜',effect:null,frame:null}),
  equipItem:(id:string)=>{fixture.equip(id);fixture.config.character=id;return true;},
}}));
import AvatarCustomization from './AvatarCustomization';
import AvatarDisplay from './AvatarDisplay';

beforeEach(()=>{fixture.config.character='char_robot';fixture.config.effect=null;fixture.equip.mockClear();});
describe('avatar presentation retains equipment and locks',()=>{
  it('equips through the existing service/callback and updates its live description',()=>{
    const onAvatarChange=vi.fn();
    render(<AvatarCustomization currentXp={0} currentStreak={0} onClose={vi.fn()} onAvatarChange={onAvatarChange}/>);
    expect(screen.getByRole('button',{name:/Ninja/})).toBeDisabled();
    fireEvent.click(screen.getByRole('button',{name:/Alien/}));
    expect(fixture.equip).toHaveBeenCalledWith('char_alien');
    expect(onAvatarChange).toHaveBeenCalledWith(expect.objectContaining({character:'char_alien'}));
    expect(screen.getByRole('button',{name:/Alien/})).toHaveAttribute('aria-pressed','true');
    expect(screen.getByText(/^Character: Alien/)).toHaveAttribute('aria-live','polite');
    expect(screen.getByRole('button',{name:/Blue/})).toHaveAttribute('aria-pressed','true');
    ['Character','Hats','Accessories','Backgrounds','Effects','Frames'].forEach(name=>expect(screen.getByRole('button',{name:new RegExp(name)})).toBeInTheDocument());
  });
  it('describes achievement locks in friendly words while keeping the item locked',()=>{
    render(<AvatarCustomization currentXp={0} currentStreak={0} onClose={vi.fn()}/>);
    const unicorn=screen.getByRole('button',{name:/Unicorn/});
    expect(unicorn).toBeDisabled();
    expect(unicorn).toHaveTextContent('Earn a perfect week');
    expect(unicorn).not.toHaveTextContent('perfect_week');
    fireEvent.click(unicorn);
    expect(fixture.equip).not.toHaveBeenCalled();
  });
  it('keeps a clickable avatar accessible from Enter and Space',()=>{
    const onClick=vi.fn();
    render(<AvatarDisplay onClick={onClick}/>);
    const avatar=screen.getByRole('button',{name:/Character: Robot/});
    fireEvent.keyDown(avatar,{key:'Enter'});fireEvent.keyDown(avatar,{key:' '});
    expect(onClick).toHaveBeenCalledTimes(2);
  });
  it('does not announce an effect that the caller hides',()=>{
    fixture.config.effect='effect_sparkle';
    render(<AvatarDisplay showEffects={false}/>);
    expect(screen.getByRole('img',{name:/Character: Robot/})).toHaveAccessibleName(/Effect: None/);
  });
});
