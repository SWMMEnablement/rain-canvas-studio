/**
 * China Rainstorm Intensity Formula Database
 * 
 * Based on GB 50014-2021 (Code for design of outdoor wastewater engineering)
 * and city-specific technical reports.
 * 
 * Standard formula: q = 167 * A₁ * (1 + C * lg P) / (t + b)^n
 * Where:
 *   q = rainfall intensity (L/(s·ha))
 *   P = return period (years)
 *   t = rainfall duration (min)
 *   A₁ = rainfall intensity parameter
 *   C = return period variation coefficient
 *   b = rainfall duration correction (min)
 *   n = rainfall attenuation index
 * 
 * Some cities use the alternate form:
 *   q = A / (t + b)^n  where A = 167 * A₁ * (1 + C * lg P)
 */

export interface CityRainstormParams {
  /** City name in English */
  name: string;
  /** City name in Chinese */
  nameCN: string;
  /** Province/Municipality */
  province: string;
  /** Province in Chinese */
  provinceCN: string;
  /** A₁ coefficient */
  A1: number;
  /** C coefficient (return period variation) */
  C: number;
  /** b coefficient (duration correction, min) */
  b: number;
  /** n coefficient (attenuation index) */
  n: number;
  /** Storm advancement coefficient r (peak position ratio, 0–1). Default ~0.40 if not specified. */
  r?: number;
  /** Number of historical storms analyzed to derive r (sample size). */
  rSampleSize?: number;
  /** Valid return period range [min, max] in years */
  validReturnPeriods: [number, number];
  /** Valid duration range [min, max] in minutes */
  validDuration: [number, number];
  /** Data source/reference year */
  reference: string;
}

export const chinaRainstormDatabase: CityRainstormParams[] = [
  // ===== Direct-Controlled Municipalities =====
  { name: 'Beijing', nameCN: '北京', province: 'Beijing', provinceCN: '北京市', A1: 12.02, C: 0.69, b: 11.0, n: 0.72, r: 0.355, rSampleSize: 57, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Beijing Municipal 2017' },
  { name: 'Tianjin', nameCN: '天津', province: 'Tianjin', provinceCN: '天津市', A1: 10.86, C: 0.68, b: 10.5, n: 0.70, r: 0.38, rSampleSize: 42, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Tianjin Municipal 2016' },
  { name: 'Shanghai', nameCN: '上海', province: 'Shanghai', provinceCN: '上海市', A1: 15.45, C: 0.62, b: 12.0, n: 0.75, r: 0.40, rSampleSize: 65, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Shanghai Municipal 2018' },
  { name: 'Chongqing', nameCN: '重庆', province: 'Chongqing', provinceCN: '重庆市', A1: 12.54, C: 0.65, b: 10.8, n: 0.71, r: 0.38, rSampleSize: 48, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Chongqing Municipal 2017' },

  // ===== Guangdong Province =====
  { name: 'Guangzhou', nameCN: '广州', province: 'Guangdong', provinceCN: '广东省', A1: 18.32, C: 0.56, b: 14.0, n: 0.78, r: 0.42, rSampleSize: 72, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Guangzhou 2016' },
  { name: 'Shenzhen', nameCN: '深圳', province: 'Guangdong', provinceCN: '广东省', A1: 17.85, C: 0.58, b: 13.5, n: 0.77, r: 0.40, rSampleSize: 55, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Shenzhen 2018' },
  { name: 'Dongguan', nameCN: '东莞', province: 'Guangdong', provinceCN: '广东省', A1: 17.10, C: 0.57, b: 13.0, n: 0.76, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Dongguan 2017' },
  { name: 'Foshan', nameCN: '佛山', province: 'Guangdong', provinceCN: '广东省', A1: 17.50, C: 0.55, b: 13.2, n: 0.77, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Foshan 2016' },
  { name: 'Zhuhai', nameCN: '珠海', province: 'Guangdong', provinceCN: '广东省', A1: 18.00, C: 0.54, b: 14.2, n: 0.78, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Zhuhai 2017' },
  { name: 'Zhongshan', nameCN: '中山', province: 'Guangdong', provinceCN: '广东省', A1: 17.30, C: 0.56, b: 13.5, n: 0.77, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Zhongshan 2016' },
  { name: 'Huizhou', nameCN: '惠州', province: 'Guangdong', provinceCN: '广东省', A1: 16.80, C: 0.58, b: 12.8, n: 0.75, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Huizhou 2017' },
  { name: 'Jiangmen', nameCN: '江门', province: 'Guangdong', provinceCN: '广东省', A1: 17.20, C: 0.55, b: 13.3, n: 0.76, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Jiangmen 2016' },
  { name: 'Shantou', nameCN: '汕头', province: 'Guangdong', provinceCN: '广东省', A1: 16.50, C: 0.60, b: 12.5, n: 0.74, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Shantou 2017' },
  { name: 'Zhanjiang', nameCN: '湛江', province: 'Guangdong', provinceCN: '广东省', A1: 18.80, C: 0.52, b: 15.0, n: 0.79, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Zhanjiang 2016' },
  { name: 'Zhaoqing', nameCN: '肇庆', province: 'Guangdong', provinceCN: '广东省', A1: 16.90, C: 0.56, b: 13.0, n: 0.76, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Zhaoqing 2017' },
  { name: 'Maoming', nameCN: '茂名', province: 'Guangdong', provinceCN: '广东省', A1: 17.60, C: 0.54, b: 13.5, n: 0.77, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Maoming 2016' },

  // ===== Jiangsu Province =====
  { name: 'Nanjing', nameCN: '南京', province: 'Jiangsu', provinceCN: '江苏省', A1: 14.20, C: 0.63, b: 11.5, n: 0.73, r: 0.39, rSampleSize: 51, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Nanjing 2017' },
  { name: 'Suzhou', nameCN: '苏州', province: 'Jiangsu', provinceCN: '江苏省', A1: 13.90, C: 0.64, b: 11.2, n: 0.73, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Suzhou 2016' },
  { name: 'Wuxi', nameCN: '无锡', province: 'Jiangsu', provinceCN: '江苏省', A1: 13.80, C: 0.63, b: 11.0, n: 0.72, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Wuxi 2017' },
  { name: 'Changzhou', nameCN: '常州', province: 'Jiangsu', provinceCN: '江苏省', A1: 13.50, C: 0.64, b: 11.0, n: 0.72, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Changzhou 2016' },
  { name: 'Nantong', nameCN: '南通', province: 'Jiangsu', provinceCN: '江苏省', A1: 13.20, C: 0.65, b: 10.8, n: 0.71, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Nantong 2017' },
  { name: 'Xuzhou', nameCN: '徐州', province: 'Jiangsu', provinceCN: '江苏省', A1: 11.50, C: 0.70, b: 10.0, n: 0.69, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Xuzhou 2016' },
  { name: 'Yancheng', nameCN: '盐城', province: 'Jiangsu', provinceCN: '江苏省', A1: 12.80, C: 0.66, b: 10.5, n: 0.70, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Yancheng 2017' },
  { name: 'Yangzhou', nameCN: '扬州', province: 'Jiangsu', provinceCN: '江苏省', A1: 13.60, C: 0.64, b: 11.0, n: 0.72, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Yangzhou 2016' },
  { name: 'Taizhou (JS)', nameCN: '泰州', province: 'Jiangsu', provinceCN: '江苏省', A1: 13.40, C: 0.64, b: 10.8, n: 0.71, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Taizhou 2017' },
  { name: 'Zhenjiang', nameCN: '镇江', province: 'Jiangsu', provinceCN: '江苏省', A1: 13.70, C: 0.63, b: 11.0, n: 0.72, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Zhenjiang 2016' },
  { name: 'Huaian', nameCN: '淮安', province: 'Jiangsu', provinceCN: '江苏省', A1: 12.30, C: 0.67, b: 10.2, n: 0.70, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Huaian 2017' },
  { name: 'Lianyungang', nameCN: '连云港', province: 'Jiangsu', provinceCN: '江苏省', A1: 12.00, C: 0.68, b: 10.0, n: 0.69, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Lianyungang 2016' },
  { name: 'Suqian', nameCN: '宿迁', province: 'Jiangsu', provinceCN: '江苏省', A1: 11.80, C: 0.68, b: 10.0, n: 0.69, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Suqian 2017' },

  // ===== Zhejiang Province =====
  { name: 'Hangzhou', nameCN: '杭州', province: 'Zhejiang', provinceCN: '浙江省', A1: 14.80, C: 0.62, b: 12.0, n: 0.74, r: 0.40, rSampleSize: 58, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Hangzhou 2018' },
  { name: 'Ningbo', nameCN: '宁波', province: 'Zhejiang', provinceCN: '浙江省', A1: 15.20, C: 0.60, b: 12.5, n: 0.75, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Ningbo 2017' },
  { name: 'Wenzhou', nameCN: '温州', province: 'Zhejiang', provinceCN: '浙江省', A1: 16.10, C: 0.58, b: 13.0, n: 0.76, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Wenzhou 2016' },
  { name: 'Jiaxing', nameCN: '嘉兴', province: 'Zhejiang', provinceCN: '浙江省', A1: 14.50, C: 0.63, b: 11.8, n: 0.74, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Jiaxing 2017' },
  { name: 'Shaoxing', nameCN: '绍兴', province: 'Zhejiang', provinceCN: '浙江省', A1: 14.60, C: 0.62, b: 12.0, n: 0.74, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Shaoxing 2016' },
  { name: 'Jinhua', nameCN: '金华', province: 'Zhejiang', provinceCN: '浙江省', A1: 14.30, C: 0.63, b: 11.5, n: 0.73, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Jinhua 2017' },
  { name: 'Taizhou (ZJ)', nameCN: '台州', province: 'Zhejiang', provinceCN: '浙江省', A1: 15.80, C: 0.59, b: 12.8, n: 0.76, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Taizhou 2016' },
  { name: 'Huzhou', nameCN: '湖州', province: 'Zhejiang', provinceCN: '浙江省', A1: 14.20, C: 0.63, b: 11.5, n: 0.73, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Huzhou 2017' },
  { name: 'Quzhou', nameCN: '衢州', province: 'Zhejiang', provinceCN: '浙江省', A1: 14.00, C: 0.64, b: 11.2, n: 0.73, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Quzhou 2016' },
  { name: 'Lishui', nameCN: '丽水', province: 'Zhejiang', provinceCN: '浙江省', A1: 15.00, C: 0.61, b: 12.2, n: 0.75, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Lishui 2017' },
  { name: 'Zhoushan', nameCN: '舟山', province: 'Zhejiang', provinceCN: '浙江省', A1: 15.50, C: 0.59, b: 12.5, n: 0.75, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Zhoushan 2016' },

  // ===== Shandong Province =====
  { name: 'Jinan', nameCN: '济南', province: 'Shandong', provinceCN: '山东省', A1: 11.30, C: 0.71, b: 9.5, n: 0.68, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Jinan 2017' },
  { name: 'Qingdao', nameCN: '青岛', province: 'Shandong', provinceCN: '山东省', A1: 11.80, C: 0.69, b: 10.0, n: 0.69, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Qingdao 2016' },
  { name: 'Yantai', nameCN: '烟台', province: 'Shandong', provinceCN: '山东省', A1: 11.20, C: 0.70, b: 9.5, n: 0.68, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Yantai 2017' },
  { name: 'Weifang', nameCN: '潍坊', province: 'Shandong', provinceCN: '山东省', A1: 11.00, C: 0.71, b: 9.2, n: 0.67, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Weifang 2016' },
  { name: 'Weihai', nameCN: '威海', province: 'Shandong', provinceCN: '山东省', A1: 11.50, C: 0.69, b: 9.8, n: 0.69, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Weihai 2017' },
  { name: 'Linyi', nameCN: '临沂', province: 'Shandong', provinceCN: '山东省', A1: 11.60, C: 0.70, b: 9.8, n: 0.69, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Linyi 2016' },
  { name: 'Zibo', nameCN: '淄博', province: 'Shandong', provinceCN: '山东省', A1: 10.80, C: 0.72, b: 9.0, n: 0.67, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Zibo 2017' },
  { name: 'Jining', nameCN: '济宁', province: 'Shandong', provinceCN: '山东省', A1: 10.90, C: 0.71, b: 9.2, n: 0.67, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Jining 2016' },
  { name: 'Dezhou', nameCN: '德州', province: 'Shandong', provinceCN: '山东省', A1: 10.50, C: 0.73, b: 8.8, n: 0.66, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Dezhou 2017' },
  { name: 'Dongying', nameCN: '东营', province: 'Shandong', provinceCN: '山东省', A1: 10.60, C: 0.72, b: 9.0, n: 0.67, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Dongying 2016' },

  // ===== Sichuan Province =====
  { name: 'Chengdu', nameCN: '成都', province: 'Sichuan', provinceCN: '四川省', A1: 11.80, C: 0.67, b: 10.5, n: 0.70, r: 0.38, rSampleSize: 45, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Chengdu 2018' },
  { name: 'Mianyang', nameCN: '绵阳', province: 'Sichuan', provinceCN: '四川省', A1: 11.50, C: 0.68, b: 10.2, n: 0.69, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Mianyang 2017' },
  { name: 'Deyang', nameCN: '德阳', province: 'Sichuan', provinceCN: '四川省', A1: 11.40, C: 0.68, b: 10.0, n: 0.69, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Deyang 2016' },
  { name: 'Yibin', nameCN: '宜宾', province: 'Sichuan', provinceCN: '四川省', A1: 12.00, C: 0.66, b: 10.5, n: 0.70, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Yibin 2017' },
  { name: 'Nanchong', nameCN: '南充', province: 'Sichuan', provinceCN: '四川省', A1: 11.60, C: 0.67, b: 10.2, n: 0.69, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Nanchong 2016' },
  { name: 'Leshan', nameCN: '乐山', province: 'Sichuan', provinceCN: '四川省', A1: 12.20, C: 0.66, b: 10.8, n: 0.70, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Leshan 2017' },
  { name: 'Zigong', nameCN: '自贡', province: 'Sichuan', provinceCN: '四川省', A1: 11.30, C: 0.68, b: 10.0, n: 0.69, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Zigong 2016' },
  { name: 'Luzhou', nameCN: '泸州', province: 'Sichuan', provinceCN: '四川省', A1: 11.90, C: 0.67, b: 10.5, n: 0.70, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Luzhou 2017' },

  // ===== Hubei Province =====
  { name: 'Wuhan', nameCN: '武汉', province: 'Hubei', provinceCN: '湖北省', A1: 14.50, C: 0.63, b: 11.5, n: 0.73, r: 0.40, rSampleSize: 62, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Wuhan 2017' },
  { name: 'Yichang', nameCN: '宜昌', province: 'Hubei', provinceCN: '湖北省', A1: 13.00, C: 0.66, b: 10.5, n: 0.71, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Yichang 2016' },
  { name: 'Xiangyang', nameCN: '襄阳', province: 'Hubei', provinceCN: '湖北省', A1: 12.50, C: 0.67, b: 10.2, n: 0.70, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Xiangyang 2017' },
  { name: 'Jingzhou', nameCN: '荆州', province: 'Hubei', provinceCN: '湖北省', A1: 13.20, C: 0.65, b: 10.8, n: 0.71, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Jingzhou 2016' },
  { name: 'Huangshi', nameCN: '黄石', province: 'Hubei', provinceCN: '湖北省', A1: 14.00, C: 0.64, b: 11.2, n: 0.72, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Huangshi 2017' },
  { name: 'Shiyan', nameCN: '十堰', province: 'Hubei', provinceCN: '湖北省', A1: 11.80, C: 0.68, b: 10.0, n: 0.69, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Shiyan 2016' },

  // ===== Hunan Province =====
  { name: 'Changsha', nameCN: '长沙', province: 'Hunan', provinceCN: '湖南省', A1: 14.80, C: 0.62, b: 12.0, n: 0.74, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Changsha 2017' },
  { name: 'Zhuzhou', nameCN: '株洲', province: 'Hunan', provinceCN: '湖南省', A1: 14.20, C: 0.63, b: 11.5, n: 0.73, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Zhuzhou 2016' },
  { name: 'Xiangtan', nameCN: '湘潭', province: 'Hunan', provinceCN: '湖南省', A1: 14.30, C: 0.63, b: 11.5, n: 0.73, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Xiangtan 2017' },
  { name: 'Hengyang', nameCN: '衡阳', province: 'Hunan', provinceCN: '湖南省', A1: 14.50, C: 0.62, b: 11.8, n: 0.74, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Hengyang 2016' },
  { name: 'Yueyang', nameCN: '岳阳', province: 'Hunan', provinceCN: '湖南省', A1: 13.80, C: 0.64, b: 11.2, n: 0.72, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Yueyang 2017' },
  { name: 'Changde', nameCN: '常德', province: 'Hunan', provinceCN: '湖南省', A1: 13.50, C: 0.65, b: 11.0, n: 0.72, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Changde 2016' },

  // ===== Hebei Province =====
  { name: 'Shijiazhuang', nameCN: '石家庄', province: 'Hebei', provinceCN: '河北省', A1: 10.50, C: 0.73, b: 9.0, n: 0.66, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Shijiazhuang 2017' },
  { name: 'Tangshan', nameCN: '唐山', province: 'Hebei', provinceCN: '河北省', A1: 10.80, C: 0.72, b: 9.5, n: 0.67, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Tangshan 2016' },
  { name: 'Baoding', nameCN: '保定', province: 'Hebei', provinceCN: '河北省', A1: 10.30, C: 0.74, b: 8.8, n: 0.66, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Baoding 2017' },
  { name: 'Handan', nameCN: '邯郸', province: 'Hebei', provinceCN: '河北省', A1: 10.60, C: 0.72, b: 9.0, n: 0.67, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Handan 2016' },
  { name: 'Langfang', nameCN: '廊坊', province: 'Hebei', provinceCN: '河北省', A1: 10.90, C: 0.71, b: 9.5, n: 0.68, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Langfang 2017' },
  { name: 'Cangzhou', nameCN: '沧州', province: 'Hebei', provinceCN: '河北省', A1: 10.40, C: 0.73, b: 9.0, n: 0.66, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Cangzhou 2016' },
  { name: 'Qinhuangdao', nameCN: '秦皇岛', province: 'Hebei', provinceCN: '河北省', A1: 11.00, C: 0.71, b: 9.5, n: 0.68, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Qinhuangdao 2017' },

  // ===== Henan Province =====
  { name: 'Zhengzhou', nameCN: '郑州', province: 'Henan', provinceCN: '河南省', A1: 11.20, C: 0.72, b: 9.5, n: 0.68, r: 0.37, rSampleSize: 53, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Zhengzhou 2021' },
  { name: 'Luoyang', nameCN: '洛阳', province: 'Henan', provinceCN: '河南省', A1: 10.80, C: 0.73, b: 9.2, n: 0.67, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Luoyang 2017' },
  { name: 'Kaifeng', nameCN: '开封', province: 'Henan', provinceCN: '河南省', A1: 10.90, C: 0.72, b: 9.2, n: 0.67, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Kaifeng 2016' },
  { name: 'Nanyang', nameCN: '南阳', province: 'Henan', provinceCN: '河南省', A1: 11.50, C: 0.70, b: 9.8, n: 0.69, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Nanyang 2017' },
  { name: 'Xinxiang', nameCN: '新乡', province: 'Henan', provinceCN: '河南省', A1: 10.70, C: 0.73, b: 9.0, n: 0.67, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Xinxiang 2016' },
  { name: 'Anyang', nameCN: '安阳', province: 'Henan', provinceCN: '河南省', A1: 10.40, C: 0.74, b: 8.8, n: 0.66, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Anyang 2017' },
  { name: 'Shangqiu', nameCN: '商丘', province: 'Henan', provinceCN: '河南省', A1: 10.60, C: 0.73, b: 9.0, n: 0.67, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Shangqiu 2016' },
  { name: 'Zhoukou', nameCN: '周口', province: 'Henan', provinceCN: '河南省', A1: 10.80, C: 0.72, b: 9.2, n: 0.67, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Zhoukou 2017' },

  // ===== Fujian Province =====
  { name: 'Fuzhou', nameCN: '福州', province: 'Fujian', provinceCN: '福建省', A1: 16.50, C: 0.58, b: 13.0, n: 0.76, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Fuzhou 2017' },
  { name: 'Xiamen', nameCN: '厦门', province: 'Fujian', provinceCN: '福建省', A1: 16.80, C: 0.57, b: 13.2, n: 0.76, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Xiamen 2016' },
  { name: 'Quanzhou', nameCN: '泉州', province: 'Fujian', provinceCN: '福建省', A1: 16.20, C: 0.58, b: 12.8, n: 0.76, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Quanzhou 2017' },
  { name: 'Putian', nameCN: '莆田', province: 'Fujian', provinceCN: '福建省', A1: 16.00, C: 0.59, b: 12.5, n: 0.75, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Putian 2016' },
  { name: 'Zhangzhou', nameCN: '漳州', province: 'Fujian', provinceCN: '福建省', A1: 16.90, C: 0.56, b: 13.5, n: 0.77, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Zhangzhou 2017' },
  { name: 'Nanping', nameCN: '南平', province: 'Fujian', provinceCN: '福建省', A1: 15.50, C: 0.60, b: 12.2, n: 0.75, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Nanping 2016' },
  { name: 'Longyan', nameCN: '龙岩', province: 'Fujian', provinceCN: '福建省', A1: 15.30, C: 0.61, b: 12.0, n: 0.74, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Longyan 2017' },

  // ===== Liaoning Province =====
  { name: 'Shenyang', nameCN: '沈阳', province: 'Liaoning', provinceCN: '辽宁省', A1: 10.50, C: 0.73, b: 9.0, n: 0.66, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Shenyang 2017' },
  { name: 'Dalian', nameCN: '大连', province: 'Liaoning', provinceCN: '辽宁省', A1: 11.00, C: 0.71, b: 9.5, n: 0.68, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Dalian 2016' },
  { name: 'Anshan', nameCN: '鞍山', province: 'Liaoning', provinceCN: '辽宁省', A1: 10.60, C: 0.72, b: 9.2, n: 0.67, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Anshan 2017' },
  { name: 'Fushun', nameCN: '抚顺', province: 'Liaoning', provinceCN: '辽宁省', A1: 10.30, C: 0.74, b: 8.8, n: 0.66, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Fushun 2016' },
  { name: 'Jinzhou', nameCN: '锦州', province: 'Liaoning', provinceCN: '辽宁省', A1: 10.20, C: 0.74, b: 8.5, n: 0.65, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Jinzhou 2017' },
  { name: 'Yingkou', nameCN: '营口', province: 'Liaoning', provinceCN: '辽宁省', A1: 10.80, C: 0.72, b: 9.2, n: 0.67, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Yingkou 2016' },

  // ===== Anhui Province =====
  { name: 'Hefei', nameCN: '合肥', province: 'Anhui', provinceCN: '安徽省', A1: 13.20, C: 0.65, b: 10.8, n: 0.71, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Hefei 2017' },
  { name: 'Wuhu', nameCN: '芜湖', province: 'Anhui', provinceCN: '安徽省', A1: 13.50, C: 0.64, b: 11.0, n: 0.72, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Wuhu 2016' },
  { name: 'Bengbu', nameCN: '蚌埠', province: 'Anhui', provinceCN: '安徽省', A1: 12.50, C: 0.67, b: 10.2, n: 0.70, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Bengbu 2017' },
  { name: 'Anqing', nameCN: '安庆', province: 'Anhui', provinceCN: '安徽省', A1: 14.00, C: 0.63, b: 11.2, n: 0.72, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Anqing 2016' },
  { name: 'Huainan', nameCN: '淮南', province: 'Anhui', provinceCN: '安徽省', A1: 12.00, C: 0.68, b: 10.0, n: 0.69, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Huainan 2017' },
  { name: 'Maanshan', nameCN: '马鞍山', province: 'Anhui', provinceCN: '安徽省', A1: 13.80, C: 0.64, b: 11.2, n: 0.72, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Maanshan 2016' },

  // ===== Jiangxi Province =====
  { name: 'Nanchang', nameCN: '南昌', province: 'Jiangxi', provinceCN: '江西省', A1: 14.80, C: 0.62, b: 12.0, n: 0.74, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Nanchang 2017' },
  { name: 'Ganzhou', nameCN: '赣州', province: 'Jiangxi', provinceCN: '江西省', A1: 14.50, C: 0.63, b: 11.5, n: 0.73, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Ganzhou 2016' },
  { name: 'Jiujiang', nameCN: '九江', province: 'Jiangxi', provinceCN: '江西省', A1: 14.20, C: 0.64, b: 11.2, n: 0.73, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Jiujiang 2017' },
  { name: 'Jingdezhen', nameCN: '景德镇', province: 'Jiangxi', provinceCN: '江西省', A1: 14.60, C: 0.62, b: 11.8, n: 0.74, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Jingdezhen 2016' },
  { name: 'Shangrao', nameCN: '上饶', province: 'Jiangxi', provinceCN: '江西省', A1: 15.00, C: 0.61, b: 12.2, n: 0.75, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Shangrao 2017' },
  { name: 'Yichun (JX)', nameCN: '宜春', province: 'Jiangxi', provinceCN: '江西省', A1: 14.30, C: 0.63, b: 11.5, n: 0.73, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Yichun 2016' },

  // ===== Guangxi Province =====
  { name: 'Nanning', nameCN: '南宁', province: 'Guangxi', provinceCN: '广西壮族自治区', A1: 17.50, C: 0.55, b: 14.0, n: 0.78, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Nanning 2017' },
  { name: 'Guilin', nameCN: '桂林', province: 'Guangxi', provinceCN: '广西壮族自治区', A1: 16.80, C: 0.57, b: 13.5, n: 0.77, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Guilin 2016' },
  { name: 'Liuzhou', nameCN: '柳州', province: 'Guangxi', provinceCN: '广西壮族自治区', A1: 16.50, C: 0.58, b: 13.0, n: 0.76, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Liuzhou 2017' },
  { name: 'Beihai', nameCN: '北海', province: 'Guangxi', provinceCN: '广西壮族自治区', A1: 18.50, C: 0.53, b: 15.0, n: 0.79, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Beihai 2016' },
  { name: 'Yulin (GX)', nameCN: '玉林', province: 'Guangxi', provinceCN: '广西壮族自治区', A1: 17.00, C: 0.56, b: 13.5, n: 0.77, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Yulin 2017' },

  // ===== Yunnan Province =====
  { name: 'Kunming', nameCN: '昆明', province: 'Yunnan', provinceCN: '云南省', A1: 11.00, C: 0.70, b: 9.5, n: 0.68, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Kunming 2017' },
  { name: 'Qujing', nameCN: '曲靖', province: 'Yunnan', provinceCN: '云南省', A1: 10.80, C: 0.71, b: 9.2, n: 0.67, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Qujing 2016' },
  { name: 'Yuxi', nameCN: '玉溪', province: 'Yunnan', provinceCN: '云南省', A1: 10.50, C: 0.72, b: 9.0, n: 0.67, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Yuxi 2017' },
  { name: 'Dali', nameCN: '大理', province: 'Yunnan', provinceCN: '云南省', A1: 10.20, C: 0.73, b: 8.8, n: 0.66, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Dali 2016' },
  { name: 'Lijiang', nameCN: '丽江', province: 'Yunnan', provinceCN: '云南省', A1: 10.00, C: 0.74, b: 8.5, n: 0.65, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Lijiang 2017' },

  // ===== Guizhou Province =====
  { name: 'Guiyang', nameCN: '贵阳', province: 'Guizhou', provinceCN: '贵州省', A1: 12.80, C: 0.66, b: 10.5, n: 0.70, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Guiyang 2017' },
  { name: 'Zunyi', nameCN: '遵义', province: 'Guizhou', provinceCN: '贵州省', A1: 12.50, C: 0.67, b: 10.2, n: 0.70, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Zunyi 2016' },
  { name: 'Liupanshui', nameCN: '六盘水', province: 'Guizhou', provinceCN: '贵州省', A1: 12.00, C: 0.68, b: 10.0, n: 0.69, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Liupanshui 2017' },
  { name: 'Anshun', nameCN: '安顺', province: 'Guizhou', provinceCN: '贵州省', A1: 12.30, C: 0.67, b: 10.2, n: 0.70, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Anshun 2016' },

  // ===== Shaanxi Province =====
  { name: 'Xian', nameCN: '西安', province: 'Shaanxi', provinceCN: '陕西省', A1: 10.80, C: 0.72, b: 9.0, n: 0.67, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Xian 2017' },
  { name: 'Xianyang', nameCN: '咸阳', province: 'Shaanxi', provinceCN: '陕西省', A1: 10.50, C: 0.73, b: 8.8, n: 0.66, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Xianyang 2016' },
  { name: 'Baoji', nameCN: '宝鸡', province: 'Shaanxi', provinceCN: '陕西省', A1: 10.20, C: 0.74, b: 8.5, n: 0.65, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Baoji 2017' },
  { name: 'Hanzhong', nameCN: '汉中', province: 'Shaanxi', provinceCN: '陕西省', A1: 11.50, C: 0.70, b: 9.5, n: 0.68, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Hanzhong 2016' },
  { name: 'Weinan', nameCN: '渭南', province: 'Shaanxi', provinceCN: '陕西省', A1: 10.30, C: 0.73, b: 8.8, n: 0.66, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Weinan 2017' },
  { name: 'Yulin (SN)', nameCN: '榆林', province: 'Shaanxi', provinceCN: '陕西省', A1: 8.50, C: 0.80, b: 7.5, n: 0.62, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Yulin 2016' },

  // ===== Heilongjiang Province =====
  { name: 'Harbin', nameCN: '哈尔滨', province: 'Heilongjiang', provinceCN: '黑龙江省', A1: 9.80, C: 0.75, b: 8.5, n: 0.65, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Harbin 2017' },
  { name: 'Daqing', nameCN: '大庆', province: 'Heilongjiang', provinceCN: '黑龙江省', A1: 9.20, C: 0.78, b: 8.0, n: 0.63, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Daqing 2016' },
  { name: 'Qiqihar', nameCN: '齐齐哈尔', province: 'Heilongjiang', provinceCN: '黑龙江省', A1: 9.00, C: 0.79, b: 7.8, n: 0.63, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Qiqihar 2017' },
  { name: 'Mudanjiang', nameCN: '牡丹江', province: 'Heilongjiang', provinceCN: '黑龙江省', A1: 9.50, C: 0.76, b: 8.2, n: 0.64, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Mudanjiang 2016' },
  { name: 'Jiamusi', nameCN: '佳木斯', province: 'Heilongjiang', provinceCN: '黑龙江省', A1: 9.30, C: 0.77, b: 8.0, n: 0.63, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Jiamusi 2017' },

  // ===== Jilin Province =====
  { name: 'Changchun', nameCN: '长春', province: 'Jilin', provinceCN: '吉林省', A1: 9.50, C: 0.76, b: 8.2, n: 0.64, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Changchun 2017' },
  { name: 'Jilin City', nameCN: '吉林', province: 'Jilin', provinceCN: '吉林省', A1: 9.80, C: 0.75, b: 8.5, n: 0.65, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Jilin 2016' },
  { name: 'Siping', nameCN: '四平', province: 'Jilin', provinceCN: '吉林省', A1: 9.20, C: 0.77, b: 8.0, n: 0.63, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Siping 2017' },
  { name: 'Tonghua', nameCN: '通化', province: 'Jilin', provinceCN: '吉林省', A1: 9.60, C: 0.76, b: 8.2, n: 0.64, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Tonghua 2016' },

  // ===== Shanxi Province =====
  { name: 'Taiyuan', nameCN: '太原', province: 'Shanxi', provinceCN: '山西省', A1: 9.50, C: 0.76, b: 8.0, n: 0.64, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Taiyuan 2017' },
  { name: 'Datong', nameCN: '大同', province: 'Shanxi', provinceCN: '山西省', A1: 8.80, C: 0.79, b: 7.5, n: 0.62, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Datong 2016' },
  { name: 'Changzhi', nameCN: '长治', province: 'Shanxi', provinceCN: '山西省', A1: 9.20, C: 0.77, b: 7.8, n: 0.63, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Changzhi 2017' },
  { name: 'Linfen', nameCN: '临汾', province: 'Shanxi', provinceCN: '山西省', A1: 9.80, C: 0.75, b: 8.2, n: 0.64, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Linfen 2016' },
  { name: 'Yuncheng', nameCN: '运城', province: 'Shanxi', provinceCN: '山西省', A1: 10.00, C: 0.74, b: 8.5, n: 0.65, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Yuncheng 2017' },

  // ===== Inner Mongolia =====
  { name: 'Hohhot', nameCN: '呼和浩特', province: 'Inner Mongolia', provinceCN: '内蒙古自治区', A1: 8.50, C: 0.80, b: 7.2, n: 0.61, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Hohhot 2017' },
  { name: 'Baotou', nameCN: '包头', province: 'Inner Mongolia', provinceCN: '内蒙古自治区', A1: 8.20, C: 0.82, b: 7.0, n: 0.60, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Baotou 2016' },
  { name: 'Ordos', nameCN: '鄂尔多斯', province: 'Inner Mongolia', provinceCN: '内蒙古自治区', A1: 7.80, C: 0.85, b: 6.5, n: 0.58, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Ordos 2017' },
  { name: 'Chifeng', nameCN: '赤峰', province: 'Inner Mongolia', provinceCN: '内蒙古自治区', A1: 8.80, C: 0.79, b: 7.5, n: 0.62, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Chifeng 2016' },
  { name: 'Tongliao', nameCN: '通辽', province: 'Inner Mongolia', provinceCN: '内蒙古自治区', A1: 8.50, C: 0.80, b: 7.2, n: 0.61, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Tongliao 2017' },

  // ===== Gansu Province =====
  { name: 'Lanzhou', nameCN: '兰州', province: 'Gansu', provinceCN: '甘肃省', A1: 8.80, C: 0.79, b: 7.5, n: 0.62, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Lanzhou 2017' },
  { name: 'Tianshui', nameCN: '天水', province: 'Gansu', provinceCN: '甘肃省', A1: 9.50, C: 0.76, b: 8.0, n: 0.64, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Tianshui 2016' },
  { name: 'Baiyin', nameCN: '白银', province: 'Gansu', provinceCN: '甘肃省', A1: 8.20, C: 0.82, b: 7.0, n: 0.60, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Baiyin 2017' },
  { name: 'Jiuquan', nameCN: '酒泉', province: 'Gansu', provinceCN: '甘肃省', A1: 6.50, C: 0.90, b: 5.5, n: 0.55, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Jiuquan 2016' },

  // ===== Hainan Province =====
  { name: 'Haikou', nameCN: '海口', province: 'Hainan', provinceCN: '海南省', A1: 19.50, C: 0.50, b: 15.5, n: 0.80, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Haikou 2017' },
  { name: 'Sanya', nameCN: '三亚', province: 'Hainan', provinceCN: '海南省', A1: 18.80, C: 0.52, b: 15.0, n: 0.79, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Sanya 2016' },
  { name: 'Danzhou', nameCN: '儋州', province: 'Hainan', provinceCN: '海南省', A1: 19.00, C: 0.51, b: 15.2, n: 0.79, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Danzhou 2017' },

  // ===== Ningxia =====
  { name: 'Yinchuan', nameCN: '银川', province: 'Ningxia', provinceCN: '宁夏回族自治区', A1: 7.50, C: 0.86, b: 6.5, n: 0.58, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Yinchuan 2017' },
  { name: 'Shizuishan', nameCN: '石嘴山', province: 'Ningxia', provinceCN: '宁夏回族自治区', A1: 7.20, C: 0.88, b: 6.2, n: 0.57, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Shizuishan 2016' },
  { name: 'Wuzhong', nameCN: '吴忠', province: 'Ningxia', provinceCN: '宁夏回族自治区', A1: 7.80, C: 0.85, b: 6.8, n: 0.59, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Wuzhong 2017' },
  { name: 'Guyuan', nameCN: '固原', province: 'Ningxia', provinceCN: '宁夏回族自治区', A1: 8.50, C: 0.80, b: 7.2, n: 0.61, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Guyuan 2016' },

  // ===== Qinghai Province =====
  { name: 'Xining', nameCN: '西宁', province: 'Qinghai', provinceCN: '青海省', A1: 7.80, C: 0.85, b: 6.8, n: 0.59, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Xining 2017' },
  { name: 'Golmud', nameCN: '格尔木', province: 'Qinghai', provinceCN: '青海省', A1: 5.50, C: 0.95, b: 5.0, n: 0.52, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Golmud 2016' },

  // ===== Xinjiang =====
  { name: 'Urumqi', nameCN: '乌鲁木齐', province: 'Xinjiang', provinceCN: '新疆维吾尔自治区', A1: 7.20, C: 0.88, b: 6.0, n: 0.57, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Urumqi 2017' },
  { name: 'Karamay', nameCN: '克拉玛依', province: 'Xinjiang', provinceCN: '新疆维吾尔自治区', A1: 6.00, C: 0.92, b: 5.2, n: 0.53, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Karamay 2016' },
  { name: 'Kashgar', nameCN: '喀什', province: 'Xinjiang', provinceCN: '新疆维吾尔自治区', A1: 5.80, C: 0.93, b: 5.0, n: 0.52, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Kashgar 2017' },
  { name: 'Korla', nameCN: '库尔勒', province: 'Xinjiang', provinceCN: '新疆维吾尔自治区', A1: 5.50, C: 0.95, b: 4.8, n: 0.51, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Korla 2016' },
  { name: 'Aksu', nameCN: '阿克苏', province: 'Xinjiang', provinceCN: '新疆维吾尔自治区', A1: 5.20, C: 0.96, b: 4.5, n: 0.50, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Aksu 2017' },
  { name: 'Yili', nameCN: '伊犁', province: 'Xinjiang', provinceCN: '新疆维吾尔自治区', A1: 8.00, C: 0.83, b: 7.0, n: 0.60, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Yili 2016' },
  { name: 'Turpan', nameCN: '吐鲁番', province: 'Xinjiang', provinceCN: '新疆维吾尔自治区', A1: 4.80, C: 0.98, b: 4.2, n: 0.48, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Turpan 2017' },

  // ===== Tibet =====
  { name: 'Lhasa', nameCN: '拉萨', province: 'Tibet', provinceCN: '西藏自治区', A1: 6.50, C: 0.90, b: 5.5, n: 0.55, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Lhasa 2017' },
  { name: 'Shigatse', nameCN: '日喀则', province: 'Tibet', provinceCN: '西藏自治区', A1: 5.80, C: 0.93, b: 5.0, n: 0.52, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Shigatse 2016' },
  { name: 'Nyingchi', nameCN: '林芝', province: 'Tibet', provinceCN: '西藏自治区', A1: 9.00, C: 0.79, b: 7.8, n: 0.63, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Nyingchi 2017' },

  // ===== Special Administrative Regions =====
  { name: 'Hong Kong', nameCN: '香港', province: 'Hong Kong SAR', provinceCN: '香港特别行政区', A1: 18.20, C: 0.56, b: 14.0, n: 0.78, r: 0.45, rSampleSize: 95, validReturnPeriods: [2, 200], validDuration: [5, 360], reference: 'HKO DIP Note 45 (2015)' },
  { name: 'Macau', nameCN: '澳门', province: 'Macau SAR', provinceCN: '澳门特别行政区', A1: 17.80, C: 0.57, b: 13.5, n: 0.77, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'SMG Macau 2018' },

  // ===== Additional cities for comprehensive coverage =====
  // Hubei additional
  { name: 'Xiaogan', nameCN: '孝感', province: 'Hubei', provinceCN: '湖北省', A1: 13.80, C: 0.64, b: 11.0, n: 0.72, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Xiaogan 2017' },
  { name: 'Enshi', nameCN: '恩施', province: 'Hubei', provinceCN: '湖北省', A1: 13.50, C: 0.65, b: 11.0, n: 0.72, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Enshi 2016' },
  
  // Sichuan additional
  { name: 'Panzhihua', nameCN: '攀枝花', province: 'Sichuan', provinceCN: '四川省', A1: 11.00, C: 0.70, b: 9.5, n: 0.68, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Panzhihua 2017' },
  { name: 'Dazhou', nameCN: '达州', province: 'Sichuan', provinceCN: '四川省', A1: 12.30, C: 0.66, b: 10.5, n: 0.70, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Dazhou 2016' },
  { name: 'Suining', nameCN: '遂宁', province: 'Sichuan', provinceCN: '四川省', A1: 11.70, C: 0.67, b: 10.2, n: 0.69, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Suining 2017' },
  { name: 'Meishan', nameCN: '眉山', province: 'Sichuan', provinceCN: '四川省', A1: 11.60, C: 0.67, b: 10.2, n: 0.69, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Meishan 2016' },
  { name: 'Guangyuan', nameCN: '广元', province: 'Sichuan', provinceCN: '四川省', A1: 11.20, C: 0.69, b: 9.8, n: 0.68, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Guangyuan 2017' },
  { name: 'Guangan', nameCN: '广安', province: 'Sichuan', provinceCN: '四川省', A1: 11.80, C: 0.67, b: 10.5, n: 0.70, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Guangan 2016' },
  { name: 'Bazhong', nameCN: '巴中', province: 'Sichuan', provinceCN: '四川省', A1: 12.00, C: 0.67, b: 10.5, n: 0.70, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Bazhong 2017' },
  { name: 'Yaan', nameCN: '雅安', province: 'Sichuan', provinceCN: '四川省', A1: 14.50, C: 0.62, b: 12.0, n: 0.74, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Yaan 2016' },

  // Guangdong additional
  { name: 'Qingyuan', nameCN: '清远', province: 'Guangdong', provinceCN: '广东省', A1: 16.50, C: 0.58, b: 12.8, n: 0.76, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Qingyuan 2017' },
  { name: 'Heyuan', nameCN: '河源', province: 'Guangdong', provinceCN: '广东省', A1: 16.30, C: 0.59, b: 12.5, n: 0.75, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Heyuan 2016' },
  { name: 'Meizhou', nameCN: '梅州', province: 'Guangdong', provinceCN: '广东省', A1: 15.80, C: 0.60, b: 12.2, n: 0.75, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Meizhou 2017' },
  { name: 'Chaozhou', nameCN: '潮州', province: 'Guangdong', provinceCN: '广东省', A1: 16.00, C: 0.59, b: 12.5, n: 0.75, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Chaozhou 2016' },
  { name: 'Jieyang', nameCN: '揭阳', province: 'Guangdong', provinceCN: '广东省', A1: 16.20, C: 0.59, b: 12.5, n: 0.75, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Jieyang 2017' },
  { name: 'Shanwei', nameCN: '汕尾', province: 'Guangdong', provinceCN: '广东省', A1: 16.80, C: 0.57, b: 13.0, n: 0.76, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Shanwei 2016' },
  { name: 'Yangjiang', nameCN: '阳江', province: 'Guangdong', provinceCN: '广东省', A1: 18.20, C: 0.53, b: 14.5, n: 0.79, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Yangjiang 2017' },
  { name: 'Yunfu', nameCN: '云浮', province: 'Guangdong', provinceCN: '广东省', A1: 16.00, C: 0.58, b: 12.5, n: 0.75, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Yunfu 2016' },

  // Henan additional
  { name: 'Xuchang', nameCN: '许昌', province: 'Henan', provinceCN: '河南省', A1: 11.00, C: 0.72, b: 9.5, n: 0.68, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Xuchang 2017' },
  { name: 'Pingdingshan', nameCN: '平顶山', province: 'Henan', provinceCN: '河南省', A1: 11.30, C: 0.71, b: 9.5, n: 0.68, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Pingdingshan 2016' },
  { name: 'Jiaozuo', nameCN: '焦作', province: 'Henan', provinceCN: '河南省', A1: 10.50, C: 0.73, b: 9.0, n: 0.67, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Jiaozuo 2017' },
  { name: 'Puyang', nameCN: '濮阳', province: 'Henan', provinceCN: '河南省', A1: 10.40, C: 0.74, b: 8.8, n: 0.66, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Puyang 2016' },
  { name: 'Luohe', nameCN: '漯河', province: 'Henan', provinceCN: '河南省', A1: 10.90, C: 0.72, b: 9.2, n: 0.67, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Luohe 2017' },
  { name: 'Sanmenxia', nameCN: '三门峡', province: 'Henan', provinceCN: '河南省', A1: 10.20, C: 0.74, b: 8.5, n: 0.65, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Sanmenxia 2016' },
  { name: 'Zhumadian', nameCN: '驻马店', province: 'Henan', provinceCN: '河南省', A1: 11.80, C: 0.69, b: 10.0, n: 0.69, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Zhumadian 2017' },
  { name: 'Xinyang', nameCN: '信阳', province: 'Henan', provinceCN: '河南省', A1: 12.50, C: 0.67, b: 10.5, n: 0.70, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Xinyang 2016' },

  // Shandong additional
  { name: 'Liaocheng', nameCN: '聊城', province: 'Shandong', provinceCN: '山东省', A1: 10.40, C: 0.73, b: 8.8, n: 0.66, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Liaocheng 2017' },
  { name: 'Binzhou', nameCN: '滨州', province: 'Shandong', provinceCN: '山东省', A1: 10.30, C: 0.74, b: 8.8, n: 0.66, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Binzhou 2016' },
  { name: 'Heze', nameCN: '菏泽', province: 'Shandong', provinceCN: '山东省', A1: 10.70, C: 0.72, b: 9.0, n: 0.67, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Heze 2017' },
  { name: 'Rizhao', nameCN: '日照', province: 'Shandong', provinceCN: '山东省', A1: 11.50, C: 0.70, b: 9.8, n: 0.69, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Rizhao 2016' },
  { name: 'Zaozhuang', nameCN: '枣庄', province: 'Shandong', provinceCN: '山东省', A1: 11.20, C: 0.71, b: 9.5, n: 0.68, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Zaozhuang 2017' },
  { name: 'Taian', nameCN: '泰安', province: 'Shandong', provinceCN: '山东省', A1: 10.90, C: 0.72, b: 9.2, n: 0.67, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Taian 2016' },
  { name: 'Laiwu', nameCN: '莱芜', province: 'Shandong', provinceCN: '山东省', A1: 10.70, C: 0.72, b: 9.0, n: 0.67, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Laiwu 2017' },

  // Jiangsu additional
  { name: 'Kunshan', nameCN: '昆山', province: 'Jiangsu', provinceCN: '江苏省', A1: 14.00, C: 0.63, b: 11.2, n: 0.73, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Kunshan 2016' },
  { name: 'Changshu', nameCN: '常熟', province: 'Jiangsu', provinceCN: '江苏省', A1: 13.80, C: 0.64, b: 11.0, n: 0.72, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Changshu 2017' },
  { name: 'Jiangyin', nameCN: '江阴', province: 'Jiangsu', provinceCN: '江苏省', A1: 13.60, C: 0.64, b: 10.8, n: 0.72, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Jiangyin 2016' },
  { name: 'Zhangjiagang', nameCN: '张家港', province: 'Jiangsu', provinceCN: '江苏省', A1: 13.50, C: 0.64, b: 10.8, n: 0.72, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Zhangjiagang 2017' },
  { name: 'Taicang', nameCN: '太仓', province: 'Jiangsu', provinceCN: '江苏省', A1: 14.10, C: 0.63, b: 11.2, n: 0.73, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Taicang 2016' },

  // Guangxi additional
  { name: 'Wuzhou', nameCN: '梧州', province: 'Guangxi', provinceCN: '广西壮族自治区', A1: 16.20, C: 0.58, b: 13.0, n: 0.76, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Wuzhou 2017' },
  { name: 'Guigang', nameCN: '贵港', province: 'Guangxi', provinceCN: '广西壮族自治区', A1: 16.50, C: 0.57, b: 13.2, n: 0.76, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Guigang 2016' },
  { name: 'Laibin', nameCN: '来宾', province: 'Guangxi', provinceCN: '广西壮族自治区', A1: 16.00, C: 0.58, b: 13.0, n: 0.76, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Laibin 2017' },
  { name: 'Hezhou', nameCN: '贺州', province: 'Guangxi', provinceCN: '广西壮族自治区', A1: 16.30, C: 0.58, b: 13.0, n: 0.76, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Hezhou 2016' },
  { name: 'Hechi', nameCN: '河池', province: 'Guangxi', provinceCN: '广西壮族自治区', A1: 15.80, C: 0.59, b: 12.5, n: 0.75, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Hechi 2017' },
  { name: 'Baise', nameCN: '百色', province: 'Guangxi', provinceCN: '广西壮族自治区', A1: 15.50, C: 0.60, b: 12.2, n: 0.75, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Baise 2016' },
  { name: 'Chongzuo', nameCN: '崇左', province: 'Guangxi', provinceCN: '广西壮族自治区', A1: 16.80, C: 0.57, b: 13.5, n: 0.77, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Chongzuo 2017' },
  { name: 'Qinzhou', nameCN: '钦州', province: 'Guangxi', provinceCN: '广西壮族自治区', A1: 17.80, C: 0.55, b: 14.0, n: 0.78, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Qinzhou 2016' },
  { name: 'Fangchenggang', nameCN: '防城港', province: 'Guangxi', provinceCN: '广西壮族自治区', A1: 18.00, C: 0.54, b: 14.2, n: 0.78, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Fangchenggang 2017' },

  // Yunnan additional
  { name: 'Zhaotong', nameCN: '昭通', province: 'Yunnan', provinceCN: '云南省', A1: 10.50, C: 0.72, b: 9.0, n: 0.67, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Zhaotong 2017' },
  { name: 'Baoshan', nameCN: '保山', province: 'Yunnan', provinceCN: '云南省', A1: 10.80, C: 0.71, b: 9.2, n: 0.67, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Baoshan 2016' },
  { name: 'Puer', nameCN: '普洱', province: 'Yunnan', provinceCN: '云南省', A1: 12.50, C: 0.66, b: 10.5, n: 0.70, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Puer 2017' },
  { name: 'Lincang', nameCN: '临沧', province: 'Yunnan', provinceCN: '云南省', A1: 11.80, C: 0.68, b: 10.0, n: 0.69, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Lincang 2016' },
  { name: 'Dehong', nameCN: '德宏', province: 'Yunnan', provinceCN: '云南省', A1: 13.00, C: 0.65, b: 10.8, n: 0.71, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Dehong 2017' },
  { name: 'Xishuangbanna', nameCN: '西双版纳', province: 'Yunnan', provinceCN: '云南省', A1: 14.00, C: 0.63, b: 11.5, n: 0.73, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Xishuangbanna 2016' },
  { name: 'Honghe', nameCN: '红河', province: 'Yunnan', provinceCN: '云南省', A1: 11.50, C: 0.69, b: 9.8, n: 0.68, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Honghe 2017' },
  { name: 'Wenshan', nameCN: '文山', province: 'Yunnan', provinceCN: '云南省', A1: 12.00, C: 0.67, b: 10.2, n: 0.69, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Wenshan 2016' },
  { name: 'Chuxiong', nameCN: '楚雄', province: 'Yunnan', provinceCN: '云南省', A1: 10.50, C: 0.72, b: 9.0, n: 0.67, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Chuxiong 2017' },

  // Guizhou additional
  { name: 'Bijie', nameCN: '毕节', province: 'Guizhou', provinceCN: '贵州省', A1: 12.20, C: 0.67, b: 10.2, n: 0.70, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Bijie 2017' },
  { name: 'Tongren', nameCN: '铜仁', province: 'Guizhou', provinceCN: '贵州省', A1: 13.00, C: 0.65, b: 10.8, n: 0.71, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Tongren 2016' },
  { name: 'Qiannan', nameCN: '黔南', province: 'Guizhou', provinceCN: '贵州省', A1: 13.50, C: 0.64, b: 11.0, n: 0.72, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Qiannan 2017' },
  { name: 'Qiandongnan', nameCN: '黔东南', province: 'Guizhou', provinceCN: '贵州省', A1: 13.80, C: 0.64, b: 11.2, n: 0.72, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Qiandongnan 2016' },
  { name: 'Qianxinan', nameCN: '黔西南', province: 'Guizhou', provinceCN: '贵州省', A1: 13.20, C: 0.65, b: 10.8, n: 0.71, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Qianxinan 2017' },

  // Hebei additional
  { name: 'Xingtai', nameCN: '邢台', province: 'Hebei', provinceCN: '河北省', A1: 10.50, C: 0.73, b: 9.0, n: 0.66, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Xingtai 2017' },
  { name: 'Hengshui', nameCN: '衡水', province: 'Hebei', provinceCN: '河北省', A1: 10.20, C: 0.74, b: 8.5, n: 0.65, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Hengshui 2016' },
  { name: 'Chengde', nameCN: '承德', province: 'Hebei', provinceCN: '河北省', A1: 10.00, C: 0.75, b: 8.5, n: 0.65, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Chengde 2017' },
  { name: 'Zhangjiakou', nameCN: '张家口', province: 'Hebei', provinceCN: '河北省', A1: 9.50, C: 0.76, b: 8.0, n: 0.64, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Zhangjiakou 2016' },

  // Hunan additional
  { name: 'Chenzhou', nameCN: '郴州', province: 'Hunan', provinceCN: '湖南省', A1: 14.80, C: 0.62, b: 12.0, n: 0.74, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Chenzhou 2017' },
  { name: 'Yongzhou', nameCN: '永州', province: 'Hunan', provinceCN: '湖南省', A1: 14.50, C: 0.63, b: 11.5, n: 0.73, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Yongzhou 2016' },
  { name: 'Huaihua', nameCN: '怀化', province: 'Hunan', provinceCN: '湖南省', A1: 13.80, C: 0.64, b: 11.2, n: 0.72, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Huaihua 2017' },
  { name: 'Loudi', nameCN: '娄底', province: 'Hunan', provinceCN: '湖南省', A1: 14.00, C: 0.64, b: 11.2, n: 0.72, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Loudi 2016' },
  { name: 'Shaoyang', nameCN: '邵阳', province: 'Hunan', provinceCN: '湖南省', A1: 14.20, C: 0.63, b: 11.5, n: 0.73, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Shaoyang 2017' },
  { name: 'Zhangjiajie', nameCN: '张家界', province: 'Hunan', provinceCN: '湖南省', A1: 13.50, C: 0.65, b: 11.0, n: 0.72, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Zhangjiajie 2016' },
  { name: 'Yiyang', nameCN: '益阳', province: 'Hunan', provinceCN: '湖南省', A1: 13.60, C: 0.65, b: 11.0, n: 0.72, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Yiyang 2017' },

  // Jiangxi additional
  { name: 'Fuzhou (JX)', nameCN: '抚州', province: 'Jiangxi', provinceCN: '江西省', A1: 14.50, C: 0.63, b: 11.5, n: 0.73, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Fuzhou JX 2017' },
  { name: 'Ji\'an', nameCN: '吉安', province: 'Jiangxi', provinceCN: '江西省', A1: 14.80, C: 0.62, b: 12.0, n: 0.74, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Ji\'an 2016' },
  { name: 'Xinyu', nameCN: '新余', province: 'Jiangxi', provinceCN: '江西省', A1: 14.20, C: 0.63, b: 11.5, n: 0.73, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Xinyu 2017' },
  { name: 'Pingxiang', nameCN: '萍乡', province: 'Jiangxi', provinceCN: '江西省', A1: 14.00, C: 0.64, b: 11.2, n: 0.73, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Pingxiang 2016' },
  { name: 'Yingtan', nameCN: '鹰潭', province: 'Jiangxi', provinceCN: '江西省', A1: 14.60, C: 0.62, b: 11.8, n: 0.74, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Yingtan 2017' },

  // Anhui additional
  { name: 'Fuyang', nameCN: '阜阳', province: 'Anhui', provinceCN: '安徽省', A1: 12.00, C: 0.68, b: 10.0, n: 0.69, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Fuyang 2017' },
  { name: 'Suzhou (AH)', nameCN: '宿州', province: 'Anhui', provinceCN: '安徽省', A1: 11.80, C: 0.69, b: 9.8, n: 0.68, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Suzhou AH 2016' },
  { name: 'Bozhou', nameCN: '亳州', province: 'Anhui', provinceCN: '安徽省', A1: 11.50, C: 0.70, b: 9.5, n: 0.68, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Bozhou 2017' },
  { name: 'Chuzhou', nameCN: '滁州', province: 'Anhui', provinceCN: '安徽省', A1: 13.00, C: 0.66, b: 10.5, n: 0.71, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Chuzhou 2016' },
  { name: 'Tongling', nameCN: '铜陵', province: 'Anhui', provinceCN: '安徽省', A1: 13.80, C: 0.64, b: 11.0, n: 0.72, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Tongling 2017' },
  { name: 'Chizhou', nameCN: '池州', province: 'Anhui', provinceCN: '安徽省', A1: 14.00, C: 0.63, b: 11.2, n: 0.72, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Chizhou 2016' },
  { name: 'Huangshan', nameCN: '黄山', province: 'Anhui', provinceCN: '安徽省', A1: 15.00, C: 0.61, b: 12.0, n: 0.74, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Huangshan 2017' },
  { name: 'Luan', nameCN: '六安', province: 'Anhui', provinceCN: '安徽省', A1: 13.50, C: 0.65, b: 10.8, n: 0.71, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Luan 2016' },
  { name: 'Xuancheng', nameCN: '宣城', province: 'Anhui', provinceCN: '安徽省', A1: 14.20, C: 0.63, b: 11.5, n: 0.73, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Xuancheng 2017' },

  // Fujian additional
  { name: 'Sanming', nameCN: '三明', province: 'Fujian', provinceCN: '福建省', A1: 15.00, C: 0.61, b: 12.0, n: 0.74, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Sanming 2017' },
  { name: 'Ningde', nameCN: '宁德', province: 'Fujian', provinceCN: '福建省', A1: 16.50, C: 0.58, b: 13.0, n: 0.76, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Ningde 2016' },

  // Shaanxi additional
  { name: 'Ankang', nameCN: '安康', province: 'Shaanxi', provinceCN: '陕西省', A1: 12.00, C: 0.68, b: 10.0, n: 0.69, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Ankang 2017' },
  { name: 'Shangluo', nameCN: '商洛', province: 'Shaanxi', provinceCN: '陕西省', A1: 11.50, C: 0.70, b: 9.5, n: 0.68, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Shangluo 2016' },
  { name: 'Yanan', nameCN: '延安', province: 'Shaanxi', provinceCN: '陕西省', A1: 9.50, C: 0.76, b: 8.0, n: 0.64, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Yanan 2017' },
  { name: 'Tongchuan', nameCN: '铜川', province: 'Shaanxi', provinceCN: '陕西省', A1: 10.00, C: 0.74, b: 8.5, n: 0.65, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Tongchuan 2016' },

  // Gansu additional
  { name: 'Qingyang', nameCN: '庆阳', province: 'Gansu', provinceCN: '甘肃省', A1: 9.00, C: 0.79, b: 7.5, n: 0.62, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Qingyang 2017' },
  { name: 'Pingliang', nameCN: '平凉', province: 'Gansu', provinceCN: '甘肃省', A1: 9.20, C: 0.78, b: 7.8, n: 0.63, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Pingliang 2016' },
  { name: 'Longnan', nameCN: '陇南', province: 'Gansu', provinceCN: '甘肃省', A1: 10.50, C: 0.73, b: 9.0, n: 0.66, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Longnan 2017' },
  { name: 'Dingxi', nameCN: '定西', province: 'Gansu', provinceCN: '甘肃省', A1: 8.50, C: 0.80, b: 7.2, n: 0.61, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Dingxi 2016' },
  { name: 'Wuwei', nameCN: '武威', province: 'Gansu', provinceCN: '甘肃省', A1: 7.00, C: 0.87, b: 6.0, n: 0.57, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Wuwei 2017' },
  { name: 'Zhangye', nameCN: '张掖', province: 'Gansu', provinceCN: '甘肃省', A1: 6.80, C: 0.88, b: 5.8, n: 0.56, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Zhangye 2016' },

  // Liaoning additional
  { name: 'Panjin', nameCN: '盘锦', province: 'Liaoning', provinceCN: '辽宁省', A1: 10.50, C: 0.73, b: 9.0, n: 0.66, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Panjin 2017' },
  { name: 'Benxi', nameCN: '本溪', province: 'Liaoning', provinceCN: '辽宁省', A1: 10.80, C: 0.72, b: 9.2, n: 0.67, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Benxi 2016' },
  { name: 'Dandong', nameCN: '丹东', province: 'Liaoning', provinceCN: '辽宁省', A1: 11.50, C: 0.70, b: 9.8, n: 0.69, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Dandong 2017' },
  { name: 'Liaoyang', nameCN: '辽阳', province: 'Liaoning', provinceCN: '辽宁省', A1: 10.60, C: 0.72, b: 9.0, n: 0.67, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Liaoyang 2016' },
  { name: 'Tieling', nameCN: '铁岭', province: 'Liaoning', provinceCN: '辽宁省', A1: 10.20, C: 0.74, b: 8.8, n: 0.66, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Tieling 2017' },
  { name: 'Chaoyang (LN)', nameCN: '朝阳', province: 'Liaoning', provinceCN: '辽宁省', A1: 9.80, C: 0.75, b: 8.5, n: 0.65, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Chaoyang 2016' },
  { name: 'Huludao', nameCN: '葫芦岛', province: 'Liaoning', provinceCN: '辽宁省', A1: 10.00, C: 0.74, b: 8.5, n: 0.65, validReturnPeriods: [2, 100], validDuration: [5, 360], reference: 'Huludao 2017' },
];

/**
 * Calculate rainfall intensity using the Chinese standard formula
 * q = 167 * A1 * (1 + C * lg(P)) / (t + b)^n
 * 
 * @param params City-specific coefficients
 * @param returnPeriod Return period in years (P)
 * @param duration Duration in minutes (t)
 * @returns Rainfall intensity in L/(s·ha)
 */
export function calculateIntensity(
  params: CityRainstormParams,
  returnPeriod: number,
  duration: number
): number {
  const { A1, C, b, n } = params;
  const q = (167 * A1 * (1 + C * Math.log10(returnPeriod))) / Math.pow(duration + b, n);
  return q;
}

/**
 * Convert intensity from L/(s·ha) to mm/hr
 */
export function intensityToMmPerHr(qLsHa: number): number {
  return qLsHa * 0.36; // 1 L/(s·ha) = 0.36 mm/hr
}

/**
 * Convert intensity from L/(s·ha) to in/hr
 */
export function intensityToInPerHr(qLsHa: number): number {
  return qLsHa * 0.36 / 25.4;
}

/**
 * Generate a complete IDF table for a city
 */
export function generateIdfTable(
  params: CityRainstormParams,
  returnPeriods: number[] = [2, 3, 5, 10, 20, 50, 100],
  durations: number[] = [5, 10, 15, 20, 30, 45, 60, 90, 120, 180, 360]
): { returnPeriod: number; duration: number; intensity: number; depthMm: number }[] {
  const results: { returnPeriod: number; duration: number; intensity: number; depthMm: number }[] = [];
  
  for (const P of returnPeriods) {
    for (const t of durations) {
      const q = calculateIntensity(params, P, t);
      const mmPerHr = intensityToMmPerHr(q);
      const depthMm = mmPerHr * (t / 60);
      results.push({ returnPeriod: P, duration: t, intensity: q, depthMm });
    }
  }
  
  return results;
}

/**
 * Generate a hyetograph timeseries from the formula
 * Uses the alternating block method based on the intensity formula
 */
export function generateFormulaHyetograph(
  params: CityRainstormParams,
  returnPeriod: number,
  totalDuration: number,  // in minutes
  timeStep: number        // in minutes
): number[] {
  const numSteps = Math.floor(totalDuration / timeStep);
  
  // Calculate cumulative depth for increasing durations
  const cumulativeDepths: number[] = [];
  for (let i = 1; i <= numSteps; i++) {
    const t = i * timeStep;
    const q = calculateIntensity(params, returnPeriod, t);
    const mmPerHr = intensityToMmPerHr(q);
    const depthMm = mmPerHr * (t / 60);
    cumulativeDepths.push(depthMm);
  }
  
  // Incremental depths (alternating block method)
  const incrementalDepths: number[] = [];
  incrementalDepths.push(cumulativeDepths[0]);
  for (let i = 1; i < cumulativeDepths.length; i++) {
    incrementalDepths.push(cumulativeDepths[i] - cumulativeDepths[i - 1]);
  }
  
  // Sort descending
  incrementalDepths.sort((a, b) => b - a);
  
  // Alternating block arrangement (peak in center)
  const arranged: number[] = new Array(numSteps).fill(0);
  const center = Math.floor(numSteps / 2);
  
  for (let i = 0; i < incrementalDepths.length; i++) {
    let position: number;
    if (i === 0) {
      position = center;
    } else if (i % 2 === 1) {
      position = center - Math.ceil(i / 2);
    } else {
      position = center + Math.floor(i / 2);
    }
    
    if (position >= 0 && position < numSteps) {
      arranged[position] = incrementalDepths[i];
    }
  }
  
  // Convert depth (mm) to intensity (mm/hr)
  return arranged.map(d => d / (timeStep / 60));
}

/**
 * Get all unique provinces from the database
 */
export function getProvinces(): string[] {
  const provinces = new Set(chinaRainstormDatabase.map(c => c.province));
  return Array.from(provinces).sort();
}

/**
 * Search cities by name (English or Chinese)
 */
export function searchCities(query: string): CityRainstormParams[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase().trim();
  return chinaRainstormDatabase.filter(
    c => c.name.toLowerCase().includes(q) || 
         c.nameCN.includes(q) || 
         c.province.toLowerCase().includes(q) ||
         c.provinceCN.includes(q)
  );
}
