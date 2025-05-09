package com.origami.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ImageComparisonResponse {
    private boolean isMatch;
    private double similarityScore;
}
