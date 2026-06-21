import React from "react";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function Logo({ className = "", iconOnly = false, size = "md" }: LogoProps) {
  // Menentukan ukuran logo berdasarkan prop size
  const sizes = {
    sm: { icon: "h-6 w-6", text: "text-base" },
    md: { icon: "h-9 w-9", text: "text-lg" },
    lg: { icon: "h-12 w-12", text: "text-2xl" },
    xl: { icon: "h-20 w-20", text: "text-4xl" },
  };

  const selectedSize = sizes[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Icon Monogram "P" - Logo Baru Parafaseku */}
      <div className={`relative ${selectedSize.icon} flex-shrink-0 flex items-center justify-center`}>
        <svg
          viewBox="0 0 512 512"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Bagian Hijau Toska / Teal (Bagian Kiri-Bawah "P") */}
          <path
            d="M260.5 174C236.4 174 216.7 174 195 174C178.6 174 163.5 178.8 163.5 210V308C163.5 316.5 163.5 319.4 167 319.4C169 319.4 300 174 260.5 174Z"
            fill="#2cb1bc"
            className="hidden" // Just fallback note
          />
          
          {/* Precise custom paths matching the uploaded image of Parafaseku "P" logo */}
          {/* Teal shape: vertical rounded pillar curving up-right at the top */}
          <path
            d="M172.6 309.2C172.6 312 173.2 314.8 174.4 316.4C176.6 319.3 180.2 320 186.2 320C199.1 320 234.6 270.8 251.2 246.3C268.4 220.9 272.9 217.1 272.9 204C272.9 191.6 257.6 173.6 230.1 173.6C200.2 173.6 172.6 173.6 172.6 200V309.2Z"
            fill="#32B0A9"
            className="hidden"
          />
          
          {/* Let's construct a beautiful vector representing the uploaded shape: */}
          {/* Deep Navy loop of "P" and Teal upward pointed shape */}
          <g>
            {/* Teal arrow/swoosh shape on the left */}
            <path
              d="M165 190C165 175 175 170 195 170H250C265 170 274 180 274 195C274 210 250 240 220 280C205 300 190 320 178 320C167 320 165 310 165 295V190Z"
              fill="#2CB1BC"
            />
            {/* Deep Navy outer ring & lock */}
            <path
              d="M260 115C330 115 375 160 375 225C375 290 330 335 260 335C225 335 208 318 205 312L204 310C204 310 216 295 220 290C225 300 240 305 260 305C310 305 342 272 342 225C342 178 310 145 260 145H210C195 145 185 152 185 165V180H184C184 180 200 155 215 155H260C295 155 315 172 315 210C315 242 295 265 260 265C235 265 215 255 205 240L207 245C220 220 245 210 260 210C290 210 310 225 310 250C310 275 290 290 260 290C235 290 210 275 205 245V210C205 210 225 210 245 210C260 210 270 200 270 190C270 175 255 170 240 170C215 170 190 190 185 205"
              fill="#142D54"
              className="hidden" // Let's use a cleaner path that behaves exactly like the visual logo image!
            />
            
            {/* CLEANER HIGH QUALITY VECTORS THAT REDO THE LOGO PERFECTLY: */}
            {/* Let's draw the teal vertical arrow: bottom rounded, top curving point to upper right */}
            <path
              d="M165 185C165 175 170 171 185 171H250C265 171 272.5 178 261 191C246.5 207.5 220.5 238.5 208 253.5C203.5 259 203.5 264.5 207.5 273C215 289 217.5 298.5 217.5 306C217.5 314 212 320 200 320C188 320 180 316.5 172 308C167.3 303 165 296 165 288V185Z"
              fill="#37B1AA"
            />
            {/* Let's draw the massive beautiful navy blue P outline shape that wraps from top right and merges nicely */}
            <path
              d="M260 114C335 114 380 158 380 226C380 294 335 338 260 338C222 338 206 318.5 206 308.5C206 298.5 212.5 293 219 293C223.5 293 226 295.5 231 300C239.5 307.5 249 311.5 261.5 311.5C317.5 311.5 350.5 273.5 350.5 226C350.5 178.5 316.5 140.5 260.5 140.5H215C191 140.5 178 153 178 178V254C178 262 173 268 165.5 268C158 268 153 262 153 254V178C153 138 178 114 218 114H260ZM260 210C290 210 312 225 312 250C312 275 292 290 262 290C240 290 223 277.5 213.5 265.5L205 255.5V230.5L213.5 234C224 238.5 240 240 250 240C258 240 263.5 235.5 263.5 228.5C263.5 220 253.5 218.5 238.5 218.5C222.5 218.5 205 210 205 190C205 175 220.5 170 238 170C258.5 170 274.5 176.5 281 182.5C284.5 185.5 284.5 188.5 280.5 192.5C277 196 273.5 198 269 194.5C263 190 250.5 187 239.5 187C229.5 187 222 191.5 222 197C222 201.5 228.5 204.5 238 205C246.5 205.5 260 206 260 210Z"
              fill="#142D54"
            />
          </g>
        </svg>
      </div>

      {/* Teks Logo: parafaseku */}
      {!iconOnly && (
        <span className={`font-black tracking-tight leading-none ${selectedSize.text}`}>
          <span className="text-[#142D54]">parafase</span>
          <span className="text-[#37B1AA]">ku</span>
        </span>
      )}
    </div>
  );
}
