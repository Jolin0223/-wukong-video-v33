window.LESSON_DIALOGUE={
  "version": "24-continuous-opening",
  "roleStatus": "W01-W09-imported",
  "intro": [
    {
      "start": 0.2,
      "end": 4.6158,
      "text": "孙悟空到火焰山脚下，发愁过不去。",
      "speaker": "旁白",
      "asset": "P01"
    },
    {
      "start": 4.95,
      "end": 9.533,
      "text": "他想借铁扇公主的芭蕉扇，却遭刁难。",
      "speaker": "旁白",
      "asset": "P02"
    },
    {
      "start": 9.9,
      "end": 14.291,
      "text": "只有闯过汉字关，才能找到真的芭蕉扇。",
      "speaker": "旁白",
      "asset": "P03"
    }
  ],
  "outro": [
    {
      "start": 0.2,
      "end": 4.627,
      "text": "太棒了，线索到手！我们继续出发！",
      "speaker": "孙悟空",
      "asset": "W09_finish"
    }
  ],
  "pendingOpeningNarration": [],
  "pendingWukong": [],
  "arrival": [
    {
      "start": 7.3,
      "end": 11.871,
      "text": "终于找到洞口了！可入口又被石头挡住了。",
      "speaker": "孙悟空",
      "asset": "W03_cave"
    },
    {
      "start": 12.5,
      "end": 17.539,
      "text": "咦，这块石头在发光！里面藏着什么秘密呢？",
      "speaker": "孙悟空",
      "asset": "W04_glow"
    }
  ],
  "mission": [
    {
      "start": 0,
      "end": 4.535,
      "text": "小伙伴，和我一起搬石识字、写字闯关吧！",
      "speaker": "孙悟空",
      "asset": "W10_mission_invite"
    }
  ]
};
window.currentDialogue=(kind,time)=>(window.LESSON_DIALOGUE[kind]||[]).find(c=>time>=c.start&&time<c.end)||null;
