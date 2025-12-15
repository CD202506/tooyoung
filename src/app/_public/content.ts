export type PublicContentItem = {
  id: string;
  type: "quote" | "notice" | "event";
  title?: string;
  content: string;
  active: boolean;
};

export const publicContentItems: PublicContentItem[] = [
  {
    id: "quote-01",
    type: "quote",
    content: "陪伴不只是照顧，而是與家人一起面對時間帶來的變化。",
    active: true,
  },
  {
    id: "quote-02",
    type: "quote",
    content: "記錄每天的細節，也是在為未來的自己留下線索。",
    active: true,
  },
  {
    id: "notice-01",
    type: "notice",
    title: "照護資料去識別化",
    content: "此處僅展示匿名與示範內容，請勿當作醫療建議。",
    active: true,
  },
  {
    id: "notice-02",
    type: "notice",
    title: "尊重家屬隱私",
    content: "公共層的案例與知識均經過處理，避免個資暴露。",
    active: true,
  },
  {
    id: "event-01",
    type: "event",
    title: "線上分享預告",
    content: "下週將分享「早期觀察與溝通」的經驗整理，敬請關注。",
    active: true,
  },
];
