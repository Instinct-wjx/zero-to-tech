import AlmanacApp from '@/components/AlmanacApp';

/* 首页（服务端组件）：静态装饰层 + 主应用 */
export default function Home() {
  return (
    <>
      {/* 宣纸纹理 + 暗角（纯静态，交给服务端渲染） */}
      <div className="paper-veil" aria-hidden="true" />
      {/* 主应用：水墨背景与全部交互（客户端组件） */}
      <AlmanacApp />
    </>
  );
}
