// 这个文件将由 shadcn 安装生成，但我们可以预先创建基本结构
import { Toast } from "./toast";

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

export function useToast() {
  return {
    toast: ({ title, description, ...props }: ToastProps) => {
      // 实现这个函数
      console.log('Toast:', { title, description, ...props });
    },
    dismiss: (toastId?: string) => {
      // 实现这个函数
      console.log('Dismiss toast:', toastId);
    },
  };
}
