import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Component hiệu ứng hoa xuân rơi (Tết theme)
 * 
 * Props:
 * - snowflakeCount: Số lượng cánh hoa (mặc định: 50)
 * - enabled: Bật/tắt hiệu ứng (mặc định: true)
 */
export function SnowEffect({ snowflakeCount = 50, enabled = true }) {
  const [petals, setPetals] = useState([]);

  useEffect(() => {
    if (!enabled) {
      setPetals([]);
      return;
    }

    // Màu sắc cánh hoa đào/mai - Tết colors
    const petalColors = [
      '#FFB3C1', // Soft pink - hoa đào
      '#FFC0CB', // Light pink
      '#FFD700', // Gold - hoa mai
      '#FFE4B5', // Moccasin - light yellow
      '#FFDAB9', // Peach puff
    ];

    // Tạo mảng các cánh hoa với thuộc tính ngẫu nhiên
    const flowerPetals = Array.from({ length: snowflakeCount }, (_, i) => ({
      id: i,
      // Vị trí ngang ngẫu nhiên (0-100%)
      left: Math.random() * 100,
      // Độ trễ animation ngẫu nhiên
      animationDelay: Math.random() * 5,
      // Thời gian rơi ngẫu nhiên (6-16 giây - chậm hơn tuyết)
      animationDuration: 6 + Math.random() * 10,
      // Kích thước ngẫu nhiên (3-8px - lớn hơn tuyết)
      size: 3 + Math.random() * 5,
      // Độ mờ ngẫu nhiên (0.4-0.7)
      opacity: 0.4 + Math.random() * 0.3,
      // Độ lệch ngang khi rơi (-60 đến 60px)
      drift: -60 + Math.random() * 120,
      // Màu sắc ngẫu nhiên
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
      // Hình dạng cánh hoa (oval)
      isOval: Math.random() > 0.3,
    }));

    setPetals(flowerPetals);
  }, [snowflakeCount, enabled]);

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {petals.map((petal) => (
        <motion.div
          key={petal.id}
          className="absolute"
          style={{
            left: `${petal.left}%`,
            top: '-10px',
            width: petal.isOval ? `${petal.size * 1.2}px` : `${petal.size}px`,
            height: `${petal.size}px`,
            opacity: petal.opacity,
            backgroundColor: petal.color,
            borderRadius: petal.isOval ? '50% 50% 50% 0' : '50%',
            boxShadow: `0 0 ${petal.size}px ${petal.color}40`,
          }}
          animate={{
            // Rơi từ trên xuống dưới
            y: ['0vh', '110vh'],
            // Lắc lư sang trái phải khi rơi - mượt mà hơn
            x: [0, petal.drift * 0.5, petal.drift, petal.drift * 0.5, 0],
            // Xoay nhẹ để tạo hiệu ứng tự nhiên - cánh hoa xoay chậm hơn
            rotate: [0, 180, 360],
            // Thêm hiệu ứng scale nhẹ
            scale: [1, 1.1, 1, 0.9, 1],
          }}
          transition={{
            duration: petal.animationDuration,
            delay: petal.animationDelay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
