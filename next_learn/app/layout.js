import { Ma_Shan_Zheng, Noto_Serif_SC } from 'next/font/google';
import './globals.css';

/* 毛笔字体（标题 / 数字）与宋体（正文），构建时自动下载并本地化 */
const brushFont = Ma_Shan_Zheng({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-brush-next',
  display: 'swap',
});

const bodyFont = Noto_Serif_SC({
  weight: ['400', '600'],
  subsets: ['latin'],
  variable: '--font-body-next',
  display: 'swap',
});

export const metadata = {
  title: '岁时记 · 传统黄历',
  description: '古风黄历：农历干支、二十四节气、节日倒计时、月历落印与水墨背景',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f4ecdb',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" className={`${brushFont.variable} ${bodyFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
