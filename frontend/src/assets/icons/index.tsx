import React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & { className?: string };

const cx = (...c: Array<string | undefined>) => c.filter(Boolean).join(" ");

export const ThreeBarsIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={cx("w-7 h-7", className)}  // 👈 tamaño por defecto
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z"
      clipRule="evenodd"
    />
  </svg>
);

export const XMarkIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={cx("w-7 h-7", className)} // 👈 tamaño por defecto
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18 18 6M6 6l12 12"
    />
  </svg>
);

export const UserIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={cx("w-6 h-6", className)}
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
    />
  </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={cx("w-5 h-5", className)}
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
    />
  </svg>
);

export const DragHandleIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    viewBox="0 0 24 24"
    className={cx("w-5 h-5", className)}
    {...props}
  >
    <circle cx="9" cy="6" r="1.5" />
    <circle cx="15" cy="6" r="1.5" />
    <circle cx="9" cy="12" r="1.5" />
    <circle cx="15" cy="12" r="1.5" />
    <circle cx="9" cy="18" r="1.5" />
    <circle cx="15" cy="18" r="1.5" />
  </svg>
);

export const ColumnsIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={cx("w-5 h-5", className)}
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 4.5v15m6-15v15M4.5 4.5h15a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18V6a1.5 1.5 0 0 1 1.5-1.5Z"
    />
  </svg>
);

export const DownloadIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={cx("w-4 h-4", className)}
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
    />
  </svg>
);

export const ExcelIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 512 512"
    className={cx("w-5 h-5", className)}
    {...props}
  >
    <style>{`
      .excelSt0{fill:#185C37;}
      .excelSt1{fill:#21A366;}
      .excelSt2{fill:#107C41;}
      .excelSt3{opacity:0.1;}
      .excelSt4{opacity:0.2;}
      .excelSt5{fill:url(#excelIconGrad1);}
      .excelSt6{fill:#FFFFFF;}
      .excelSt7{fill:#33C481;}
    `}</style>
    <path className="excelSt0" d="M321.49,244.09l-202.42-35.72v263.94c0,12.05,9.77,21.83,21.83,21.83l0,0h349.28	c12.05,0,21.83-9.77,21.83-21.83l0,0v-97.24L321.49,244.09z" />
    <path className="excelSt1" d="M321.49,17.86H140.9c-12.05,0-21.83,9.77-21.83,21.83l0,0v97.24L321.49,256l107.16,35.72L512,256V136.93	L321.49,17.86z" />
    <path className="excelSt2" d="M119.07,136.93h202.42V256H119.07V136.93z" />
    <path className="excelSt3" d="M263.94,113.12H119.07v297.67h144.87c12.04-0.04,21.79-9.79,21.83-21.83V134.94	C285.73,122.9,275.98,113.16,263.94,113.12z" />
    <path className="excelSt4" d="M252.04,125.02H119.07V422.7h132.97c12.04-0.04,21.79-9.79,21.83-21.83V146.85	C273.82,134.81,264.07,125.06,252.04,125.02z" />
    <path className="excelSt4" d="M252.04,125.02H119.07v273.86h132.97c12.04-0.04,21.79-9.79,21.83-21.83V146.85	C273.82,134.81,264.07,125.06,252.04,125.02z" />
    <path className="excelSt4" d="M240.13,125.02H119.07v273.86h121.06c12.04-0.04,21.79-9.79,21.83-21.83V146.85	C261.91,134.81,252.17,125.06,240.13,125.02z" />
    <linearGradient
      id="excelIconGrad1"
      gradientUnits="userSpaceOnUse"
      x1="45.5065"
      y1="-1464.0308"
      x2="216.4467"
      y2="-1167.9695"
      gradientTransform="matrix(1 0 0 1 0 1572)"
    >
      <stop offset="0" style={{ stopColor: "#18884F" }} />
      <stop offset="0.5" style={{ stopColor: "#117E43" }} />
      <stop offset="1" style={{ stopColor: "#0B6631" }} />
    </linearGradient>
    <path className="excelSt5" d="M21.83,125.02h218.3c12.05,0,21.83,9.77,21.83,21.83v218.3c0,12.05-9.77,21.83-21.83,21.83H21.83	C9.77,386.98,0,377.21,0,365.15v-218.3C0,134.79,9.77,125.02,21.83,125.02z" />
    <path
      className="excelSt6"
      d="M67.6,326.94l45.91-71.14l-42.07-70.75h33.84l22.96,45.25c2.12,4.3,3.57,7.49,4.36,9.6h0.3	c1.51-3.43,3.1-6.76,4.76-9.99l24.54-44.83h31.07l-43.14,70.33l44.23,71.54H161.3l-26.52-49.66c-1.25-2.11-2.31-4.33-3.17-6.63	h-0.39c-0.78,2.25-1.81,4.41-3.07,6.43l-27.3,49.87L67.6,326.94L67.6,326.94z"
    />
    <path className="excelSt7" d="M490.17,17.86H321.49v119.07H512V39.69C512,27.63,502.23,17.86,490.17,17.86L490.17,17.86z" />
    <path className="excelSt2" d="M321.49,256H512v119.07H321.49V256z" />
  </svg>
);

export const FilterIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={cx("w-3.5 h-3.5", className)}
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
    />
  </svg>
);

export const EyeIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={cx("w-5 h-5", className)}
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

export const EyeOffIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={cx("w-5 h-5", className)}
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
    />
  </svg>
);

export const LogoutIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={cx("w-6 h-6", className)}
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
    />
  </svg>
);